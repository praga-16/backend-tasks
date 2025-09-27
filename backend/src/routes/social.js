const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

/**
 * --------------------------------
 * GITHUB ANALYTICS
 * --------------------------------
 */

// Top 5 GitHub issues by comment count
router.get('/github/top-issues', requireAuth, async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    const q = `
      SELECT repo_full_name, issue_number, title, author_login, comments
      FROM github_issues
      WHERE state IS NOT NULL
      ORDER BY comments DESC
      LIMIT $1
    `;
    const { rows } = await db.query(q, [limit]);
    res.json(rows);
  } catch (err) { next(err); }
});

// Author with the most GitHub issues
router.get('/github/top-author', requireAuth, async (req, res, next) => {
  try {
    const q = `
      SELECT author_login, COUNT(*) AS issue_count
      FROM github_issues
      GROUP BY author_login
      ORDER BY issue_count DESC
      LIMIT 1
    `;
    const { rows } = await db.query(q);
    res.json(rows[0] || {});
  } catch (err) { next(err); }
});

// Repo with the most open issues
router.get('/github/top-repo', requireAuth, async (req, res, next) => {
  try {
    const q = `
      SELECT repo_full_name, COUNT(*) AS open_issues
      FROM github_issues
      WHERE state = 'open'
      GROUP BY repo_full_name
      ORDER BY open_issues DESC
      LIMIT 1
    `;
    const { rows } = await db.query(q);
    res.json(rows[0] || {});
  } catch (err) { next(err); }
});

/**
 * --------------------------------
 * REDDIT ANALYTICS
 * --------------------------------
 */

// Top 5 Reddit posts by upvotes
router.get('/reddit/top-posts', requireAuth, async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    const q = `
      SELECT subreddit, external_id, title, author, score
      FROM reddit_posts
      ORDER BY score DESC
      LIMIT $1
    `;
    const { rows } = await db.query(q, [limit]);
    res.json(rows);
  } catch (err) { next(err); }
});

// Reddit author with the highest total upvotes
router.get('/reddit/top-author', requireAuth, async (req, res, next) => {
  try {
    const q = `
      SELECT author, SUM(score) AS total_upvotes
      FROM reddit_posts
      GROUP BY author
      ORDER BY total_upvotes DESC
      LIMIT 1
    `;
    const { rows } = await db.query(q);
    res.json(rows[0] || {});
  } catch (err) { next(err); }
});

module.exports = router;
