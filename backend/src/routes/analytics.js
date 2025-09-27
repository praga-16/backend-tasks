const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

router.get('/leaderboard', requireAuth, async (req, res, next) => {
  try {
    const { period = '30d', limit = 10 } = req.query;


    const match = /^(\d+)d$/.exec(period);
    const days = match ? parseInt(match[1], 10) : 30;

    const q = `
      SELECT u.user_id, u.name, COUNT(t.*) AS completed_tasks
      FROM users u
      JOIN tasks t ON t.assigned_user_id = u.user_id
      WHERE t.status = 'completed'
        AND t.created_at >= now() - INTERVAL '${days} days'
        AND t.deleted_at IS NULL
      GROUP BY u.user_id, u.name
      ORDER BY completed_tasks DESC
      LIMIT $1
    `;
    const { rows } = await db.query(q, [limit]);
    return res.json(rows);
  } catch (err) { next(err); }
});


router.get('/task-stats', requireAuth, async (req, res, next) => {
  try {
    const { from, to, group_by = 'day' } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'from and to required' });

    const groupClause = group_by === 'month'
      ? "to_char(created_at, 'YYYY-MM')"
      : "to_char(created_at, 'YYYY-MM-DD')";

    const createdQ = `
      SELECT ${groupClause} AS period, COUNT(*) AS created
      FROM tasks
      WHERE created_at BETWEEN $1 AND $2
        AND deleted_at IS NULL
      GROUP BY period
    `;

    const completedQ = `
      SELECT ${groupClause} AS period, COUNT(*) AS completed
      FROM tasks
      WHERE created_at BETWEEN $1 AND $2
        AND status = 'completed'
        AND deleted_at IS NULL
      GROUP BY period
    `;

    const [createdRes, completedRes] = await Promise.all([
      db.query(createdQ, [from, to]),
      db.query(completedQ, [from, to])
    ]);

    
    const map = {};
    createdRes.rows.forEach(r => {
      map[r.period] = { date: r.period, created: parseInt(r.created, 10), completed: 0 };
    });
    completedRes.rows.forEach(r => {
      if (!map[r.period]) map[r.period] = { date: r.period, created: 0, completed: 0 };
      map[r.period].completed = parseInt(r.completed, 10);
    });

    return res.json({
      meta: { from, to, group_by },
      data: Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
    });
  } catch (err) { next(err); }
});

module.exports = router;
