---
tags:
  - getting-started
  - config
---

# Environment Variables

## Backend (`backend/.env`)

Copy from `backend/.env.example`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/messaging_board
JWT_ACCESS_SECRET=change-me-access-secret
JWT_REFRESH_SECRET=change-me-refresh-secret
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection URI |
| `JWT_ACCESS_SECRET` | Yes | Min 16 chars; signs short-lived access tokens |
| `JWT_REFRESH_SECRET` | Yes | Min 16 chars; signs refresh tokens |
| `JWT_ACCESS_TTL` | No | Default `15m` |
| `JWT_REFRESH_TTL` | No | Default `7d` |
| `PORT` | No | Default `3001` |
| `FRONTEND_URL` | No | CORS origin; default `http://localhost:3000` |
| `NODE_ENV` | No | `development` \| `production` \| `test` |

Validated at startup via Joi in `backend/src/config/configuration.ts`.

## Frontend (`frontend/.env.local`)

Copy from `frontend/.env.local.example`:

```env
NEXT_PUBLIC_API_URL=/api
BACKEND_URL=http://localhost:3001
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Base path for API calls from the browser (`/api`) |
| `BACKEND_URL` | Target for Next.js rewrite proxy (server-side only) |

## Docker Compose (PostgreSQL)

Defined in `docker-compose.yml`:

| Variable | Value |
|----------|-------|
| `POSTGRES_USER` | `postgres` |
| `POSTGRES_PASSWORD` | `postgres` |
| `POSTGRES_DB` | `messaging_board` |

## Related notes

- [[Getting Started/Running Locally]]
- [[Getting Started/Login and Credentials]]
