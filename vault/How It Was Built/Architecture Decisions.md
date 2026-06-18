---
tags:
  - architecture
  - decisions
---

# Architecture Decisions

Key decisions from `Project_Plan.md` and their rationale.

## Authentication model

**Decision:** Short-lived JWT access token (in memory) + long-lived refresh token in `httpOnly` cookie.

| Benefit | Trade-off |
|---------|-----------|
| No `localStorage` XSS exposure | Hard refresh loses access token until silent refresh |
| Stateless API (horizontally scalable) | Cookie must be sent with `credentials: 'include'` |

Implementation: `backend/src/auth/auth.service.ts`, `frontend/app/lib/api.ts`

---

## Tagging strategy

**Decision:** Fixed enum — `General`, `Tech`, `Random`, `Announcement`, `Question`.

| Benefit | Trade-off |
|---------|-----------|
| Deterministic filter UI (dropdown) | No free-form tags |
| No separate `tags` table for v1 | Less flexible for users |

Future work: normalize to a `tags` table if needed.

---

## Pagination

**Decision:** Cursor-based (keyset) pagination on `(created_at, id)`.

| Benefit | Trade-off |
|---------|-----------|
| Stable under concurrent inserts | Slightly more complex than offset |
| Scales to large tables | Client must pass `nextCursor` |

Returns `{ items, nextCursor }` from `GET /messages`.

---

## Filtering

**Decision:** Single parameterized QueryBuilder query combining optional `tag`, `userId`, `from`, `to`.

Backed by composite indexes — see [[Database/Indexes]].

---

## Ownership enforcement

**Decision:** `MessageOwnerGuard` on PATCH and DELETE.

```text
message.authorId === req.user.id  →  allow
otherwise                         →  403 Forbidden
```

UI also hides controls for non-owners (defense in depth).

---

## Validation & errors

**Decision:** Global `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`.

- Strips unknown properties from request bodies
- Rejects requests with extra fields
- DTOs use `class-validator` decorators

---

## Frontend data layer

**Decision:** TanStack React Query with `useInfiniteQuery` for the feed.

| Benefit |
|---------|
| Built-in caching, retry, pagination |
| Natural fit for cursor-based API |
| Mutation hooks for create/update/delete |

---

## Scaling notes (bonus question)

For thousands of reads/sec (not MVP scope):

- Horizontal scaling of stateless NestJS replicas
- Redis cache-aside for hot feeds
- Postgres read replicas for `GET /messages`
- CDN for static assets
- Rate limiting on write endpoints
- Prometheus/Grafana + structured logging

See `Project_Plan.md` Section 4 for full list.

## Related notes

- [[How It Was Built/Development Phases]]
- [[Backend/Authentication]]
- [[Backend/Messages Module]]
