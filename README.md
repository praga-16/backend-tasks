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
