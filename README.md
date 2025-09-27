# Backend Tasks – Assessment 1

## 📌 Overview
This project implements a **Task Management System** backend with:
- **User Management** (register/login with JWT)  
- **Task Management** (CRUD, filters, cursor pagination, optimistic locking, soft delete)  
- **Analytics** (leaderboard and task statistics)  

Built with **Node.js (Express) + PostgreSQL + Redis (for caching option)**.  

---

## 🚀 Getting Started

### Prerequisites
- Node.js (>=18)  
- Docker Desktop (for PostgreSQL container)  

### Setup
```bash
git clone https://github.com/praga-16/backend-tasks.git
cd backend/backend
cp .env.example .env
docker-compose up -d        # starts PostgreSQL
npm run migrate             # applies schema
npm run dev                 # start server at http://localhost:4000
```
### 🔑 Environment Variables (.env)
```
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/backend_tasks
JWT_SECRET=your_super_secret_key
BCRYPT_SALT_ROUNDS=10
```
### 📚 API Documentation
``
Base URL: http://localhost:4000/api
``
1. Authentication & User Management
Register

POST /auth/register
```
{ "name": "Alice", "email": "alice@example.com", "password": "pass123" }

```
Response:
```
{ "user_id": 1, "name": "Alice", "email": "alice@example.com", "registration_date": "2025-09-27T..." }
```
Login

POST /auth/login
```
{ "email": "alice@example.com", "password": "pass123" }
```

Response:
```
{ "access_token": "JWT_TOKEN", "expires_in": 900 }
```
2. Task Management
Create Task

POST /tasks
```
{ "title":"Finish backend","description":"Implement CRUD","priority":"high","assigned_user_id":1 }
```

Response:
```
{ "task_id": 3, "title":"Finish backend", "status":"pending", "priority":"high", "version":1 }
```
List Tasks (filters + pagination)

GET /tasks?status=pending&priority=high&limit=20&cursor=2025-09-27T07:00:00Z|3
```
{
  "data": [ { "task_id":3,"title":"Finish backend","status":"pending" } ],
  "next_cursor": "2025-09-27T07:00:00Z|3",
  "limit": 20
}
```
Update Task (optimistic locking)

PUT /tasks/3
```
{ "status":"completed","expected_version":1 }

```
Response:
```
{ "task_id":3, "version":2 }
```
Delete Task (soft delete)

DELETE /tasks/3
```
{ "deleted": true }
```
3. Analytics
Leaderboard

GET /analytics/leaderboard?period=30d&limit=5
```
[
  { "user_id":1, "name":"Alice", "completed_tasks":1 }
]
```
Task Stats

GET /analytics/task-stats?from=2025-09-01&to=2025-09-30&group_by=day
```
{
  "meta": { "from":"2025-09-01","to":"2025-09-30","group_by":"day" },
  "data": [
    { "date":"2025-09-27","created":1,"completed":1 }
  ]
}
```
### System Architecture

Components:

API Layer: Node.js + Express (stateless, containerized)

DB: PostgreSQL (ACID, scalable with indexes & partitions)

Cache: Redis (leaderboards, frequently queried results)

Scaling:

Horizontal API scaling behind load balancer

DB read replicas for analytics queries

PgBouncer for connection pooling

Redis clustering for cache

Diagram (simplified):

Client → API (Node.js) → PostgreSQL (OLTP)
                   ↘→ Redis (cache: leaderboard, stats)


### Completed Tasks

 API Design (User, Task, Analytics + examples)

 System Architecture with DB, caching, scaling reasoning

 Performance considerations (indexing, pagination, caching, concurrency)

### git

Push code to GitHub:
```
git add .
git commit -m "feat: completed API design, analytics, docs"
git push origin main
```
### 📊 Task 2 — Social Media Aggregator
📌 Overview

This task implements a Social Media Aggregator that collects data from GitHub and Reddit, and provides analytics endpoints.

GitHub Analytics

Top 5 issues by comment count

Author with most issues across repos

Repo with the most open issues

Reddit Analytics

Top 5 posts by upvotes

Author with highest total upvotes

For demonstration, mock fetchers are included that insert sample issues/posts.

### 🛠️ Database Schema

GitHub Issues

```repo_full_name (e.g., octocat/hello-world)

issue_number

author_login

state (open/closed)

comments (comment count)

Reddit Posts

subreddit

external_id (t3_xxx)

title, author

score (upvotes)

Indexes are created on:

repo_full_name, author_login, comments, state (GitHub)

subreddit, author, score, created_utc (Reddit)
```
### 📚 API Documentation
``
Base URL: http://localhost:4000/api/social``
(Requires JWT token in Authorization: Bearer <token>)

🔹 GitHub Analytics
1. Top 5 Issues by Comment Count

GET /github/top-issues?limit=5
Response:
```
[
  {
    "repo_full_name": "octocat/hello-world",
    "issue_number": 1,
    "title": "Bug in feature X",
    "author_login": "alice",
    "comments": 15
  }
]
```
2. Author with Most Issues

GET /github/top-author
Response:
```
{
  "author_login": "alice",
  "issue_count": "1"
}
```
3. Repo with Most Open Issues

GET /github/top-repo
Response:
```
{
  "repo_full_name": "octocat/hello-world",
  "open_issues": "1"
}
```
### 🔹 Reddit Analytics
1. Top 5 Posts by Upvotes

GET /reddit/top-posts?limit=5
Response:
```
[
  {
    "subreddit": "learnprogramming",
    "external_id": "t3_abc123",
    "title": "Why use Node.js?",
    "author": "bob",
    "score": 250
  }
]
```
2. Author with Highest Total Upvotes

GET /reddit/top-author
Response:
```
{
  "author": "bob",
  "total_upvotes": "250"
}
```
<img width="1251" height="439" alt="image" src="https://github.com/user-attachments/assets/58788253-b99b-4321-8f39-4a66eaf48be3" />


~~~
Client → API (Express) → PostgreSQL
                          ↘
                          Redis (optional cache for analytics)
~~~

###  Completed Candidate Tasks (Task 2)

 DB schema for GitHub + Reddit

 API Design with request/response examples

 System Architecture with DB + caching

 Performance considerations

 ### git:
 ```
 git pull origin main --rebase
git push origin main
```
