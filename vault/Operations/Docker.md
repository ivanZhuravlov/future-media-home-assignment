---
tags:
  - operations
  - docker
---

# Docker

## docker-compose.yml

Currently provides **PostgreSQL only** (backend and frontend run locally via npm).

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: messaging-board-db
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: messaging_board
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

## Commands

```bash
# Start database
docker compose up -d

# Stop database
docker compose down

# Stop and remove data volume
docker compose down -v
```

## Connect directly

```bash
psql postgresql://postgres:postgres@localhost:5432/messaging_board
```

Useful queries:

```sql
SELECT id, email, username, created_at FROM users;
SELECT id, content, tag, author_id, created_at FROM messages ORDER BY created_at DESC LIMIT 10;
```

## Future (Phase 6 plan)

`Project_Plan.md` mentions extending compose to include backend + frontend services for one-command startup. Not yet implemented.

## Related notes

- [[Getting Started/Running Locally]]
- [[Getting Started/Environment Variables]]
- [[Database/Schema and Migrations]]
