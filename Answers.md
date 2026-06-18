# Scaling & Production — Brief Answers

Assuming the messaging board must handle **thousands of read requests per second** while keeping writes correct and latency low.

---

## How would you scale it?

**Horizontal scaling of the API.** The NestJS backend is stateless (JWT auth, no server-side sessions), so you can run multiple replicas behind a load balancer (Nginx). Autoscale on CPU, memory, or request rate (HPA).

**Offload reads from Postgres.**

- **Redis cache-aside** for hot feeds — default feed and popular tag filters cached with a short TTL (5–10 s). Invalidate on writes to the affected tag/author. Most read traffic never hits the database.
- **Postgres read replicas** for `GET /messages`. Writes go to the primary; read queries route to replicas via PgBouncer, pgpool, or application-level connection routing.

**Edge and static assets.** Serve the Next.js static bundle from a CDN. Public, non-personalized responses benefit without touching origin servers.

**Database fundamentals already in place.** Cursor (keyset) pagination on `(created_at, id)` and composite indexes on `(tag, created_at, id)` and `(author_id, created_at, id)` avoid expensive `OFFSET` scans and full-table sorts as data grows.

**Write-path protection.** Rate-limit `POST/PATCH/DELETE` (`@nestjs/throttler` or API gateway) so read spikes do not starve the DB via concurrent writes.

**Further scale.** If filter combinations explode, introduce a denormalized read model (materialized view or Elasticsearch) updated asynchronously — a CQRS-style read side.

---

## How would you ensure minimal response time at scale?

1. **Cache hot paths** — Redis in front of the default feed and top tag feeds; target cache hit ratio > 90% for anonymous browsing.
2. **Keep queries index-only where possible** — composite indexes match filter + sort patterns; no `SELECT *` without need; use connection pooling (PgBouncer).
3. **Pagination without OFFSET** — keyset cursors (already implemented) stay O(log n) per page regardless of depth.
4. **Reduce payload size** — return only fields the client needs; enable gzip/brotli at the load balancer.
5. **Co-locate services** — API, Redis, and DB in the same region/AZ to cut network RTT.
6. **CDN for frontend** — HTML/JS/CSS served from edge; API stays regional.
7. **Async work off the hot path** — notifications, analytics, and search indexing via a queue (SQS, RabbitMQ), not inline with the HTTP response.

Target SLO example: **p99 < 200 ms** for cached feed reads, **p99 < 500 ms** for uncached filtered reads.

---

## How would you ensure fault tolerance?

1. **Multi-instance API** — at least two replicas per AZ; load balancer health checks remove unhealthy pods.
2. **Managed Postgres with failover** — RDS Multi-AZ, Cloud SQL HA, or Patroni; automatic promotion of standby on primary failure.
3. **Graceful degradation** — if Postgres is unreachable, serve the last good cached feed from Redis with a stale indicator rather than a 500.
4. **Circuit breakers and retries** — bounded retries with exponential backoff on inter-service calls; open circuit after repeated failures to avoid cascade.
5. **Idempotent writes where possible** — client-supplied idempotency keys on message creation to safely retry failed POSTs.
6. **Database connection limits** — PgBouncer prevents connection storms when replicas scale up.
7. **Deployments** — rolling updates with readiness probes; run migrations as a separate job before rolling the API.

---

## How would you monitor performance and errors in production?

**Metrics (Prometheus + Grafana)**

- Request rate, error rate, latency histograms (p50 / p95 / p99) per endpoint
- Postgres: active connections, query duration, replication lag
- Redis: hit ratio, memory, evictions
- Infrastructure: CPU, memory, disk per service

**Structured logging (pino → Loki)**

- JSON logs with `requestId`, `userId`, `method`, `path`, `statusCode`, `durationMs`
- Correlate frontend and backend via a shared trace/request ID header

**Distributed tracing (OpenTelemetry → Jaeger / Tempo / X-Ray)**

- Trace a request from Next.js → NestJS → Postgres/Redis to find slow spans

**Error tracking (Sentry or similar)**

- Capture unhandled exceptions with stack traces and release context
- Alert on error-rate spikes and new error types

**Alerting**

- SLO-based alerts: error rate > 1%, p99 latency breach, replica lag > threshold, pod restarts, cache hit ratio drop
- On-call runbooks linked from alert descriptions

**Health checks**

- `/health` endpoint with DB ping (`@nestjs/terminus`) for load balancer

---

## Related documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) — application structure and design decisions
- [README.md](./README.md) — local and Docker setup instructions
