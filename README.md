# Micro-Messaging Board

A full-stack messaging board where users can register, post short tagged messages, filter the feed, and edit or delete their own posts. Built with **NestJS**, **Next.js 14**, **PostgreSQL**, and **TypeORM**.

## Features

- User registration and JWT-based authentication
- Post messages up to 240 characters with a fixed tag (category)
- Message feed with filters (tag, username, date/time range)
- Inline edit and delete for message authors only
- Infinite scroll with cursor-based pagination

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- npm
- [Docker](https://www.docker.com/) (for PostgreSQL)

## Local setup

### 1. start the database

```bash

docker compose up -d
```

PostgreSQL runs on `localhost:5432` with:

| Setting  | Value             |
|----------|-------------------|
| Database | `messaging_board` |
| User     | `postgres`        |
| Password | `postgres`        |

### 2. Backend

```bash
cd backend
cp .env.example .env
npm ci
npm run migration:run
npm run start:dev
```

The API starts at **http://localhost:3001**.

Environment variables are documented in `backend/.env.example`. At minimum, ensure `DATABASE_URL` matches your Docker credentials and set strong values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (each at least 16 characters).

### 3. Frontend

In a second terminal:

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

The app starts at **http://localhost:3000**.

The frontend proxies API requests from `/api/*` to the backend (`BACKEND_URL` in `.env.local`).

### 4. Create an account and use the app

There are **no pre-seeded users**. Register first:

1. Open **http://localhost:3000/register**
2. Enter email, username (min 3 chars), and password (min 8 chars)
3. You are redirected to `/messages` after registration

From the Messages page you can:

- **Post** — use the "New message" form (tag + content, max 240 chars)
- **Filter** — by tag, username, or date/time range, then click **Apply filters**
- **Edit / Delete** — only on your own messages
- **Load more** — scroll down; older messages load automatically

## Scripts

### Backend (`backend/`)

| Command                  | Description                    |
|--------------------------|--------------------------------|
| `npm run start:dev`      | Dev server with hot reload     |
| `npm run build`          | Production build               |
| `npm run start:prod`     | Run production build           |
| `npm run migration:run`  | Apply database migrations      |
| `npm run migration:revert` | Revert last migration        |
| `npm test`               | Unit tests                     |
| `npm run test:e2e`       | End-to-end tests               |
| `npm run lint`           | ESLint                         |

### Frontend (`frontend/`)

| Command           | Description              |
|-------------------|--------------------------|
| `npm run dev`     | Dev server               |
| `npm run build`   | Production build         |
| `npm run start`   | Run production build     |
| `npm test`        | Component tests (Jest)   |
| `npm run lint`    | ESLint                   |

## Project structure

```
├── backend/          NestJS API (auth, messages, users)
├── frontend/         Next.js 14 App Router UI
├── docker-compose.yml
├── Project_Plan.md   Requirements and development roadmap
├── ARCHITECTURE.md   Design decisions and structure
└── vault/            Obsidian knowledge base (optional)
```

## API overview

| Method   | Path              | Auth     | Description              |
|----------|-------------------|----------|--------------------------|
| `POST`   | `/auth/register`  | No       | Create account           |
| `POST`   | `/auth/login`     | No       | Log in                   |
| `POST`   | `/auth/refresh`   | Cookie   | Refresh access token     |
| `GET`    | `/messages`       | No       | List messages (filtered) |
| `POST`   | `/messages`       | Bearer   | Create message           |
| `PATCH`  | `/messages/:id`   | Bearer   | Update own message       |
| `DELETE` | `/messages/:id`   | Bearer   | Delete own message       |

## Troubleshooting

| Problem | Likely fix |
|---------|------------|
| `ECONNREFUSED` on database | Run `docker compose up -d` from the repo root |
| Migration errors | Check `DATABASE_URL` in `backend/.env` |
| Redirected to `/login` on `/messages` | Register or log in; a `refresh_token` cookie is required |
| CORS errors | Ensure `FRONTEND_URL=http://localhost:3000` in `backend/.env` |
| API calls fail from browser | Confirm backend is running on port 3001 and `BACKEND_URL` matches |

## Further reading

- [ARCHITECTURE.md](./ARCHITECTURE.md) — structure, design decisions, and next steps
- [Project_Plan.md](./Project_Plan.md) — original requirements and phased roadmap
