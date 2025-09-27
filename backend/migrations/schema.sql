
CREATE TABLE IF NOT EXISTS users (
  user_id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  registration_date TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS tasks (
  task_id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_user_id BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',   
  priority TEXT NOT NULL DEFAULT 'medium',  
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  version BIGINT NOT NULL DEFAULT 1,
  deleted_at TIMESTAMPTZ
);


CREATE INDEX IF NOT EXISTS idx_tasks_assigned_user_id ON tasks (assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks (due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_status_due ON tasks (assigned_user_id, status, due_date);
