-- GitHub issues table
CREATE TABLE IF NOT EXISTS github_issues (
  id BIGSERIAL PRIMARY KEY,
  external_id TEXT NOT NULL,             -- GitHub issue ID
  repo_full_name TEXT NOT NULL,          -- e.g., "owner/repo"
  issue_number INTEGER NOT NULL,
  title TEXT,
  body TEXT,
  author_login TEXT,
  state TEXT,                            -- open, closed
  comments INTEGER DEFAULT 0,            -- number of comments
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  raw JSONB,
  UNIQUE (repo_full_name, issue_number)
);

CREATE INDEX IF NOT EXISTS idx_github_repo ON github_issues(repo_full_name);
CREATE INDEX IF NOT EXISTS idx_github_author ON github_issues(author_login);
CREATE INDEX IF NOT EXISTS idx_github_comments ON github_issues(comments DESC);
CREATE INDEX IF NOT EXISTS idx_github_state ON github_issues(state);

-- Reddit posts table
CREATE TABLE IF NOT EXISTS reddit_posts (
  id BIGSERIAL PRIMARY KEY,
  external_id TEXT NOT NULL UNIQUE,      -- Reddit post ID (t3_xxx)
  subreddit TEXT NOT NULL,
  title TEXT,
  body TEXT,
  author TEXT,
  score INTEGER DEFAULT 0,               -- upvotes
  created_utc TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  raw JSONB
);

CREATE INDEX IF NOT EXISTS idx_reddit_subreddit ON reddit_posts(subreddit);
CREATE INDEX IF NOT EXISTS idx_reddit_author ON reddit_posts(author);
CREATE INDEX IF NOT EXISTS idx_reddit_score ON reddit_posts(score DESC);
CREATE INDEX IF NOT EXISTS idx_reddit_created ON reddit_posts(created_utc DESC);
