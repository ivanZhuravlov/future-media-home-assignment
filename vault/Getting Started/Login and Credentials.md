---
tags:
  - getting-started
  - credentials
  - auth
---

# Login and Credentials

> [!important] No pre-seeded app users
> This application does **not** ship with default login accounts. You must **register** a new user before you can log in.

## How to log in (application)

### Option 1 — Web UI (recommended)

1. Start the stack (see [[Getting Started/Running Locally]])
2. Open **http://localhost:3000/register**
3. Create an account with:
   - **Email** — valid email format (e.g. `you@example.com`)
   - **Username** — minimum 3 characters
   - **Password** — minimum **8** characters
4. After registration you are logged in automatically and redirected to `/messages`
5. To log in again later, go to **http://localhost:3000/login** with the same email and password

### Option 2 — API (curl)

**Register:**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","username":"demo","password":"password123"}' \
  -c cookies.txt
```

**Login:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}' \
  -c cookies.txt
```

The response includes `accessToken` and `user`. The refresh token is set as an `httpOnly` cookie named `refresh_token`.

## Example credentials (if you register them)

These are **not** pre-created — use them only if you register with these values:

| Field | Example value |
|-------|---------------|
| Email | `demo@example.com` |
| Username | `demo` |
| Password | `password123` |

## PostgreSQL credentials (database only)

These are for connecting to the database directly — **not** for the web app login:

| Variable | Value |
|----------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `messaging_board` |
| User | `postgres` |
| Password | `postgres` |

Connection string:
```
postgresql://postgres:postgres@localhost:5432/messaging_board
```

## JWT secrets (backend)

Configured in `backend/.env` (copy from `backend/.env.example`):

| Variable | Default in example |
|----------|-------------------|
| `JWT_ACCESS_SECRET` | `change-me-access-secret` |
| `JWT_REFRESH_SECRET` | `change-me-refresh-secret` |
| `JWT_ACCESS_TTL` | `15m` |
| `JWT_REFRESH_TTL` | `7d` |

> [!warning] Production
> Change JWT secrets to strong random values before deploying.

## Auth flow summary

1. **Login/Register** → access token in response body, refresh token in cookie
2. **API calls** → `Authorization: Bearer <accessToken>` header
3. **401 response** → frontend calls `POST /auth/refresh` with cookie to get a new access token
4. **Middleware** → Next.js checks for `refresh_token` cookie to gate `/messages`

See also: [[Backend/Authentication]]
