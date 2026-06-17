# Project Plan — Micro-Messaging Board (NestJS + Next.js)

> [!INFO] Source
> Derived from the "SDE Challenge – Full Stack" brief. This document is the single source of truth (`@Project_Plan.md`) for the virtual team: **[Senior Architect]**, **[Database Lead]**, **[Security & QA Guard]**.

---

## 1. High-Level Analysis

### Core architectural decisions
- **Auth model**: short-lived JWT access token (stored in memory on the client) + long-lived refresh token in an `httpOnly`/`secure` cookie. Avoids `localStorage` XSS exposure while keeping the API stateless/horizontally scalable.
- **Tagging**: a small **fixed enum** (`General`, `Tech`, `Random`, `Announcement`, `Question`) rather than free-text tags. Trade-off: less flexible for users, but it keeps filter UI deterministic (dropdown vs. fuzzy search) and avoids a separate `tags` table for a v1 scope. Documented as an easy follow-up to normalize.
- **Pagination strategy**: **cursor-based (keyset) pagination** on `(created_at, id)` rather than `OFFSET/LIMIT`. Offset pagination degrades on large tables and is unstable when new rows are inserted during scroll — both are realistic for a live message feed.
- **Filtering**: combined query (`tag`, `author`, `dateFrom`/`dateTo`) executed as a single parameterized query via TypeORM's QueryBuilder, backed by composite indexes (Section 2).
- **Ownership enforcement**: a dedicated `MessageOwnerGuard` checks `message.authorId === req.user.id` for `PATCH`/`DELETE`, returning `403 Forbidden`. Enforced server-side regardless of what the UI hides.
- **Validation & error shape**: global `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`) + a global exception filter producing a consistent `{ statusCode, message, error, timestamp, path }` envelope.
- **Frontend data layer**: React Query (`useInfiniteQuery`) for the message feed — gives caching, retry, and infinite-scroll primitives "for free" and pairs naturally with cursor pagination.

> [!INFO] Trade-offs accepted
> - Fixed tag enum trades flexibility for simplicity/performance — acceptable for v1, flagged as future work.
> - Cursor pagination is slightly more complex to implement than offset, but is the correct long-term choice given the "thousands of reads/sec" bonus question.
> - JWT access token in memory means a hard refresh logs the user out until silent-refresh runs — acceptable UX trade-off for security.

---

## 2. System Design

### 2.1 Database Schema (PostgreSQL via TypeORM)

```sql
-- users
id            UUID PK DEFAULT gen_random_uuid()
email         VARCHAR UNIQUE NOT NULL  -- indexed
username      VARCHAR UNIQUE NOT NULL  -- indexed
password_hash VARCHAR NOT NULL
created_at    TIMESTAMPTZ DEFAULT now()
updated_at    TIMESTAMPTZ DEFAULT now()

-- messages
id            UUID PK DEFAULT gen_random_uuid()
content       VARCHAR(240) NOT NULL
tag           VARCHAR NOT NULL          -- enum-constrained at app layer
author_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
created_at    TIMESTAMPTZ DEFAULT now()
updated_at    TIMESTAMPTZ DEFAULT now()

-- Composite indexes (Database Lead)
CREATE INDEX idx_messages_created_at        ON messages (created_at DESC, id);
CREATE INDEX idx_messages_tag_created_at    ON messages (tag, created_at DESC, id);
CREATE INDEX idx_messages_author_created_at ON messages (author_id, created_at DESC, id);
```

> [!INFO] Why these indexes
> Every filter combination (default feed, tag feed, user feed) hits a `created_at DESC` sort — each composite index covers one access pattern without a sort step.

### 2.2 Backend Module Structure (NestJS)

```
backend/src
├── main.ts
├── app.module.ts
├── config/
│   └── configuration.ts        # env validation (Joi)
├── database/
│   ├── data-source.ts
│   └── migrations/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/jwt.strategy.ts
│   ├── strategies/jwt-refresh.strategy.ts
│   ├── guards/jwt-auth.guard.ts
│   └── dto/{register,login}.dto.ts
├── users/
│   ├── users.module.ts
│   ├── users.service.ts
│   └── entities/user.entity.ts
├── messages/
│   ├── messages.module.ts
│   ├── messages.controller.ts
│   ├── messages.service.ts
│   ├── entities/message.entity.ts
│   ├── enums/tag.enum.ts
│   ├── guards/message-owner.guard.ts
│   └── dto/{create-message,update-message,query-messages}.dto.ts
├── common/
│   ├── filters/http-exception.filter.ts
│   ├── interceptors/logging.interceptor.ts
│   └── decorators/current-user.decorator.ts
└── health/
    ├── health.module.ts
    └── health.controller.ts
```

### 2.3 Frontend Module Structure (Next.js App Router)

```
frontend/app
├── layout.tsx
├── page.tsx                    # redirects → /messages or /login
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── messages/
│   └── page.tsx                # Message Page (feed + filters)
├── components/
│   ├── MessageCard.tsx         # inline edit/delete, ownership-aware
│   ├── MessageComposer.tsx     # 240-char counter, tag selector
│   ├── FilterBar.tsx           # tag / user / date range
│   ├── TagBadge.tsx
│   └── InfiniteScrollSentinel.tsx
├── context/
│   └── AuthContext.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useMessagesFeed.ts       # React Query useInfiniteQuery
├── lib/
│   └── api.ts                   # fetch wrapper, attaches access token, handles 401 refresh
└── middleware.ts                # redirects unauthenticated users
```

---

## 3. The Roadmap

### Phase 0 — Project Scaffolding
- [ ] [Senior Architect] Bootstrap NestJS project, ESLint/Prettier, base `app.module.ts` — `backend/`
- [ ] [Senior Architect] Bootstrap Next.js (App Router, TypeScript, Tailwind) — `frontend/`
- [ ] [Database Lead] Add `docker-compose.yml` with PostgreSQL service + volume — `docker-compose.yml`
- [ ] [Database Lead] Configure TypeORM `DataSource` + env-driven config — `backend/src/database/data-source.ts`

### Phase 1 — Authentication
- [ ] [Database Lead] `User` entity + initial migration (unique indexes on `email`, `username`) — `backend/src/users/entities/user.entity.ts`
- [ ] [Senior Architect] `AuthModule`: register, login, refresh endpoints — `backend/src/auth/`
- [ ] [Security & QA Guard] `RegisterDto` / `LoginDto` with `class-validator` (email format, password min length) — `backend/src/auth/dto/`
- [ ] [Security & QA Guard] `JwtStrategy` + `JwtAuthGuard`, password hashing with `bcrypt` — `backend/src/auth/`
- [ ] [Senior Architect] `AuthContext` + login/register pages + `lib/api.ts` token handling — `frontend/app/(auth)/`

### Phase 2 — Messages CRUD
- [ ] [Database Lead] `Message` entity + migration (`content` `varchar(240)`, `tag`, `author_id` FK) — `backend/src/messages/entities/message.entity.ts`
- [ ] [Senior Architect] `MessagesController`/`MessagesService`: `POST /messages`, `GET /messages`, `PATCH /messages/:id`, `DELETE /messages/:id` — `backend/src/messages/`
- [ ] [Security & QA Guard] `CreateMessageDto`/`UpdateMessageDto` — enforce `@MaxLength(240)`, `@IsEnum(Tag)` — `backend/src/messages/dto/`
- [ ] [Security & QA Guard] `MessageOwnerGuard` for `PATCH`/`DELETE`, returns `403` on mismatch — `backend/src/messages/guards/message-owner.guard.ts`

### Phase 3 — Filtering & Infinite Scroll
- [ ] [Database Lead] Add composite indexes from Section 2.1 via migration — `backend/src/database/migrations/`
- [ ] [Senior Architect] `QueryMessagesDto` (`tag?`, `userId?`, `from?`, `to?`, `cursor?`, `limit?`) + QueryBuilder implementation in `MessagesService.findMany()` — `backend/src/messages/messages.service.ts`
- [ ] [Senior Architect] `FilterBar` component (tag dropdown, user/date inputs) — `frontend/app/components/FilterBar.tsx`
- [ ] [Senior Architect] `useMessagesFeed` (`useInfiniteQuery`) + `InfiniteScrollSentinel` (IntersectionObserver) — `frontend/app/hooks/useMessagesFeed.ts`

### Phase 4 — Inline Edit / Delete UX
- [ ] [Senior Architect] `MessageCard` inline-edit mode (textarea swap, char counter, save/cancel) with optimistic React Query update — `frontend/app/components/MessageCard.tsx`
- [ ] [Security & QA Guard] Conditionally render edit/delete controls only when `message.authorId === currentUser.id` (defense in depth — backend is the real gate)

### Phase 5 — Testing, Errors, Observability
- [ ] [Security & QA Guard] Unit test: `MessagesService.create()` rejects content > 240 chars / invalid tag — `backend/src/messages/messages.service.spec.ts`
- [ ] [Security & QA Guard] Component test: `MessageCard` toggles inline edit and calls update handler — `frontend/app/components/MessageCard.test.tsx`
- [ ] [Senior Architect] Global `HttpExceptionFilter` + `LoggingInterceptor` (request id, latency) using `nestjs-pino` — `backend/src/common/`
- [ ] [Senior Architect] `/health` endpoint via `@nestjs/terminus` (DB ping) — `backend/src/health/`

### Phase 6 — Docs, Env, Docker
- [ ] [Senior Architect] `README.md` — setup, run, scripts
- [ ] [Senior Architect] `ARCHITECTURE.md` — decisions log + Bonus Question (Section 4 below)
- [ ] [Database Lead] `docker-compose.yml` — postgres + backend + frontend services
- [ ] [Security & QA Guard] `.env.example` — `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`, `PORT`

---

## 4. High Read Load — Scaling Notes (for ARCHITECTURE.md / Bonus Question)

> [!INFO] Scope
> These are the talking points to expand into prose for the bonus question. Framed as "what changes at thousands of RPS, not at MVP scale."

- **Horizontal scaling**: NestJS app is stateless (JWT, no server-side sessions) → run N replicas behind a load balancer (Nginx/ALB), autoscale on CPU/RPS via k8s HPA or equivalent.
- **Caching hot reads**: Redis cache-aside for the default feed and popular tag feeds (short TTL, e.g. 5–10s), invalidated on writes to that tag/feed. Most reads never touch Postgres.
- **Database read scaling**: Postgres read replicas for `GET /messages`; writes go to primary. TypeORM connection routing or a proxy (PgBouncer/pgpool) directs traffic.
- **Query efficiency**: keyset pagination (already chosen) + the composite indexes from Section 2.1 avoid expensive `OFFSET` scans and unnecessary sorts at any table size.
- **CDN / edge**: static frontend assets and any public, non-personalized pages served via CDN/edge cache; reduces origin load entirely for those requests.
- **Fault tolerance**: multi-AZ deployment, managed Postgres with automatic failover, circuit breakers + retries with backoff on inter-service calls, graceful degradation (serve last-good cached feed if DB is unreachable).
- **Backpressure / abuse protection**: `@nestjs/throttler` (or gateway-level rate limiting) on write endpoints to protect the DB from spikes.
- **Monitoring**: Prometheus + Grafana for latency (p50/p95/p99), error rate, throughput; structured logs (pino) shipped to a log aggregator (Loki/ELK); distributed tracing via OpenTelemetry; alerting on SLO breaches (error rate, p99 latency, replica lag).
- **Path to further scale**: if filter combinations explode, consider a denormalized read model (materialized view or Elasticsearch index) updated asynchronously — classic CQRS read-side.

---

## 5. Execution Prompts (Golden Instructions for Cursor)

```
Act as [Database Lead]. Refer to @Project_Plan.md, Phase 0 and Phase 1.
Set up the TypeORM DataSource configuration and implement the User entity
at backend/src/users/entities/user.entity.ts with unique indexes on
email and username, plus the corresponding initial migration.
```

```
Act as [Senior Architect]. Refer to @Project_Plan.md, Phase 1.
Implement AuthModule (register, login, refresh) using Passport JWT
strategies. Access tokens are short-lived and returned in the response
body; refresh tokens are set as httpOnly secure cookies. Follow the
module structure in Section 2.2.
```

```
Act as [Security & QA Guard]. Refer to @Project_Plan.md, Phase 2.
Implement CreateMessageDto and UpdateMessageDto with class-validator:
content is required, max length 240, and tag must be one of the values
in messages/enums/tag.enum.ts. Then implement MessageOwnerGuard that
returns 403 if the authenticated user does not own the message being
edited or deleted.
```

```
Act as [Senior Architect]. Refer to @Project_Plan.md, Phase 3.
Implement MessagesService.findMany() using TypeORM QueryBuilder,
supporting optional tag, userId, from/to date filters, and cursor-based
pagination on (created_at, id) as described in Section 1 and 2.1.
Return { items, nextCursor }.
```

```
Act as [Senior Architect]. Refer to @Project_Plan.md, Phase 3 and Phase 4.
Build the Message Page at frontend/app/messages/page.tsx: FilterBar for
tag/user/date, useMessagesFeed (React Query useInfiniteQuery) wired to
GET /messages, and MessageCard with inline edit/delete that only renders
controls for the message's author.
```

```
Act as [Security & QA Guard]. Refer to @Project_Plan.md, Phase 5.
Write a Jest unit test for MessagesService.create() covering: rejection
of content over 240 characters, rejection of an invalid tag, and
successful creation with a valid payload. Mock the repository.
```