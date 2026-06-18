---
tags:
  - database
  - typeorm
  - migrations
---

# Schema and Migrations

## Tables

### users

```sql
id            UUID PK DEFAULT gen_random_uuid()
email         VARCHAR UNIQUE NOT NULL
username      VARCHAR UNIQUE NOT NULL
password_hash VARCHAR NOT NULL
created_at    TIMESTAMPTZ DEFAULT now()
updated_at    TIMESTAMPTZ DEFAULT now()
```

### messages

```sql
id         UUID PK DEFAULT gen_random_uuid()
content    VARCHAR(240) NOT NULL
tag        VARCHAR NOT NULL
author_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

## Migrations

| File | Purpose |
|------|---------|
| `1740000000000-InitUsers.ts` | Create `users` table + unique indexes |
| `1740000000001-InitMessages.ts` | Create `messages` table + FK |
| `1740000000002-AddMessageIndexes.ts` | Composite indexes for feed queries |

## Commands

```bash
cd backend
npm run migration:run      # Apply all pending
npm run migration:revert   # Revert last
```

Uses `backend/src/database/data-source.ts` for CLI.

## TypeORM config

- `synchronize: false` — **never** auto-sync schema in production
- `autoLoadEntities: true`
- Connection via `DATABASE_URL` env var

## Entity files

- `backend/src/users/entities/user.entity.ts`
- `backend/src/messages/entities/message.entity.ts`

## Related notes

- [[Database/Indexes]]
- [[Operations/Docker]]
- [[Getting Started/Environment Variables]]
