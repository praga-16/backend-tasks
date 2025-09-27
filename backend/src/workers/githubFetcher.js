// Mock GitHub fetcher (insert demo data)
const db = require('../db');

async function fetchGitHubMock() {
  const sample = {
    external_id: '1001',
    repo_full_name: 'octocat/hello-world',
    issue_number: 1,
    title: 'Bug in feature X',
    body: 'Something went wrong',
    author_login: 'alice',
    state: 'open',
    comments: 15,
    created_at: new Date(),
    updated_at: new Date(),
    raw: {}
  };

  const q = `
    INSERT INTO github_issues (external_id, repo_full_name, issue_number, title, body, author_login, state, comments, created_at, updated_at, raw)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    ON CONFLICT (repo_full_name, issue_number) DO NOTHING
  `;

  await db.query(q, [
    sample.external_id,
    sample.repo_full_name,
    sample.issue_number,
    sample.title,
    sample.body,
    sample.author_login,
    sample.state,
    sample.comments,
    sample.created_at,
    sample.updated_at,
    JSON.stringify(sample.raw)
  ]);

  console.log('Inserted mock GitHub issue');
}

module.exports = { fetchGitHubMock };
