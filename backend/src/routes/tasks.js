const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

function parseCursor(cursor) {
  if (!cursor) return null;
  const parts = cursor.split('|');
  if (parts.length !== 2) return null;
  return { created_at: parts[0], task_id: parseInt(parts[1], 10) };
}

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { title, description, assigned_user_id, priority = 'medium', due_date } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });

    const q = `INSERT INTO tasks (title, description, assigned_user_id, priority, due_date)
               VALUES ($1,$2,$3,$4,$5) RETURNING task_id, title, description, assigned_user_id, status, priority, due_date, created_at, version`;
    const { rows } = await db.query(q, [title, description || null, assigned_user_id || null, priority, due_date || null]);
    return res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});


router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const q = `SELECT task_id, title, description, assigned_user_id, status, priority, due_date, created_at, version
               FROM tasks WHERE task_id = $1 AND deleted_at IS NULL`;
    const { rows } = await db.query(q, [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Task not found' });
    return res.json(rows[0]);
  } catch (err) { next(err); }
});


router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { status, priority, due_before, limit = 20, cursor } = req.query;
    const parsed = parseCursor(cursor);
    const params = [];
    const where = ['deleted_at IS NULL'];

    if (status) { params.push(status); where.push(`status = $${params.length}`); }
    if (priority) { params.push(priority); where.push(`priority = $${params.length}`); }
    if (due_before) { params.push(new Date(due_before)); where.push(`due_date <= $${params.length}`); }

    if (parsed) {
      params.push(parsed.created_at);
      params.push(parsed.task_id);
      where.push(`(created_at, task_id) < ($${params.length - 1}::timestamptz, $${params.length}::bigint)`);
    }

    params.push(parseInt(limit, 10) > 100 ? 100 : parseInt(limit, 10));
    const q = `
      SELECT task_id, title, description, assigned_user_id, status, priority, due_date, created_at, version
      FROM tasks
      WHERE ${where.join(' AND ')}
      ORDER BY created_at DESC, task_id DESC
      LIMIT $${params.length}
    `;
    const { rows } = await db.query(q, params);

    let next_cursor = null;
    if (rows.length === params[params.length - 1]) {
      const last = rows[rows.length - 1];
      next_cursor = `${last.created_at.toISOString()}|${last.task_id}`;
    }

    return res.json({ data: rows, next_cursor, limit: params[params.length - 1] });
  } catch (err) { next(err); }
});


router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, priority, assigned_user_id, expected_version } = req.body;
    if (!expected_version && expected_version !== 0) return res.status(400).json({ error: 'expected_version required for optimistic locking' });

    const sets = [];
    const params = [];
    if (status) { params.push(status); sets.push(`status = $${params.length}`); }
    if (priority) { params.push(priority); sets.push(`priority = $${params.length}`); }
    if (assigned_user_id !== undefined) { params.push(assigned_user_id); sets.push(`assigned_user_id = $${params.length}`); }

    if (sets.length === 0) return res.status(400).json({ error: 'Nothing to update' });

   
    params.push(id);
    params.push(expected_version);

    const q = `
      UPDATE tasks
      SET ${sets.join(', ')}, version = version + 1
      WHERE task_id = $${params.length - 1} AND version = $${params.length} AND deleted_at IS NULL
      RETURNING task_id, version
    `;
    const { rows } = await db.query(q, params);
    if (!rows[0]) return res.status(409).json({ error: 'Conflict or task not found (version mismatch?)' });
    return res.json(rows[0]);
  } catch (err) { next(err); }
});


router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const q = `UPDATE tasks SET deleted_at = now() WHERE task_id = $1 AND deleted_at IS NULL RETURNING task_id`;
    const { rows } = await db.query(q, [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Task not found' });
    return res.json({ deleted: true });
  } catch (err) { next(err); }
});

module.exports = router;
