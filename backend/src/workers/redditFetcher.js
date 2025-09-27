
const db = require('../db');

async function fetchRedditMock() {
  const sample = {
    external_id: 't3_abc123',
    subreddit: 'learnprogramming',
    title: 'Why use Node.js?',
    body: 'Discussion',
    author: 'bob',
    score: 250,
    created_utc: new Date(),
    raw: {}
  };

  const q = `
    INSERT INTO reddit_posts (external_id, subreddit, title, body, author, score, created_utc, raw)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    ON CONFLICT (external_id) DO NOTHING
  `;

  await db.query(q, [
    sample.external_id,
    sample.subreddit,
    sample.title,
    sample.body,
    sample.author,
    sample.score,
    sample.created_utc,
    JSON.stringify(sample.raw)
  ]);

  console.log('Inserted mock Reddit post');
}

module.exports = { fetchRedditMock };
