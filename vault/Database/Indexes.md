---
tags:
  - database
  - performance
  - indexes
---

# Indexes

Composite indexes support the three main feed access patterns — all sort by `created_at DESC, id`.

## Index definitions

```sql
CREATE INDEX idx_messages_created_at
  ON messages (created_at DESC, id);

CREATE INDEX idx_messages_tag_created_at
  ON messages (tag, created_at DESC, id);

CREATE INDEX idx_messages_author_created_at
  ON messages (author_id, created_at DESC, id);
```

## Query → index mapping

| Filter | Index used |
|--------|------------|
| Default feed (no filters) | `idx_messages_created_at` |
| Filter by tag | `idx_messages_tag_created_at` |
| Filter by author (`userId`) | `idx_messages_author_created_at` |

## Why keyset pagination pairs with indexes

Cursor pagination uses `(created_at, id)` as the sort key:

```sql
WHERE (created_at, id) < (:cursorCreatedAt, :cursorId)
ORDER BY created_at DESC, id DESC
LIMIT :limit
```

Each composite index covers the filter column(s) **and** the sort columns, avoiding a separate sort step.

## User table indexes

Unique constraints on `email` and `username` (created in InitUsers migration) support fast lookup during login and registration conflict checks.

## Related notes

- [[Database/Schema and Migrations]]
- [[How It Was Built/Architecture Decisions]]
- [[Backend/Messages Module]]
