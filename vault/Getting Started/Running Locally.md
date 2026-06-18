---
tags:
  - getting-started
  - setup
---

# Running Locally

## Prerequisites

- Node.js 20+
- npm
- Docker (for PostgreSQL)

## Step 1 — Start PostgreSQL

From the repo root:

```bash
docker compose up -d
```

This starts PostgreSQL on port **5432** with database `messaging_board`.

See [[Operations/Docker]] for details.

## Step 2 — Backend setup

```bash
cd backend
cp .env.example .env    # if .env does not exist
npm install
npm run migration:run
npm run start:dev
```

Backend runs at **http://localhost:3001**

## Step 3 — Frontend setup

In a second terminal:

```bash
cd frontend
cp .env.local.example .env.local    # if .env.local does not exist
npm install
npm run dev
```

Frontend runs at **http://localhost:3000**

## Step 4 — Create a user and use the app

1. Visit http://localhost:3000/register
2. Register an account (see [[Getting Started/Login and Credentials]])
3. You will land on the message feed at `/messages`

## Useful scripts

### Backend (`backend/`)

| Command | Purpose |
|---------|---------|
| `npm run start:dev` | Dev server with hot reload |
| `npm run migration:run` | Apply DB migrations |
| `npm run migration:revert` | Revert last migration |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run e2e tests |

### Frontend (`frontend/`)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm test` | Jest component tests |

## API routing

The frontend proxies API calls:

- Browser requests: `http://localhost:3000/api/...`
- Rewritten to: `http://localhost:3001/...` (via `next.config.mjs`)

Set `BACKEND_URL` in `frontend/.env.local` if the backend port changes.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| DB connection refused | Run `docker compose up -d` |
| Migration errors | Ensure `DATABASE_URL` in `backend/.env` matches Docker credentials |
| 401 on messages page | Register or log in; check `refresh_token` cookie exists |
| CORS errors | Ensure `FRONTEND_URL=http://localhost:3000` in backend `.env` |

## Related notes

- [[Getting Started/Environment Variables]]
- [[Getting Started/Login and Credentials]]
