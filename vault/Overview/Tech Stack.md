---
tags:
  - overview
  - tech-stack
---

# Tech Stack

## Backend

| Technology | Version / role |
|------------|----------------|
| **NestJS** | v10 — modular API framework |
| **TypeORM** | v0.3 — ORM + migrations |
| **PostgreSQL** | v16 (Docker) |
| **Passport + JWT** | Access + refresh token auth |
| **bcrypt** | Password hashing (12 rounds) |
| **class-validator** | DTO validation |
| **Joi** | Environment variable validation |
| **Jest** | Unit & e2e tests |

## Frontend

| Technology | Version / role |
|------------|----------------|
| **Next.js** | 14.2 — App Router |
| **React** | 18 |
| **TypeScript** | Strict mode |
| **Tailwind CSS** | Styling |
| **TanStack React Query** | Infinite scroll feed, caching, mutations |
| **Jest + Testing Library** | Component tests |

## Infrastructure

| Component | Details |
|-----------|---------|
| **Docker Compose** | PostgreSQL 16 Alpine |
| **API proxy** | Next.js rewrite `/api/*` → `BACKEND_URL` |

## Architectural patterns

- **DDD-inspired modules**: `auth`, `users`, `messages`
- **Controller-Service-Repository**: business logic in services only
- **Defense in depth**: UI hides edit/delete for non-owners; backend enforces with guards
- **Global ValidationPipe**: `whitelist: true`, `forbidNonWhitelisted: true`

## Related notes

- [[Backend/NestJS Structure]]
- [[Frontend/Next.js Structure]]
- [[Database/Schema and Migrations]]
