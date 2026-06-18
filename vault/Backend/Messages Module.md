---
tags:
  - backend
  - messages
---

# Messages Module

## Responsibilities

- Create messages (authenticated)
- List messages with filters and cursor pagination (public)
- Update/delete messages (owner only)

## Entity

`messages` table:

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `content` | varchar(240) | Max length enforced in DTO |
| `tag` | varchar | App-layer enum |
| `author_id` | UUID | FK → `users.id`, CASCADE delete |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

## DTOs

| DTO | Rules |
|-----|-------|
| `CreateMessageDto` | `content` required, max 240, `tag` must be enum |
| `UpdateMessageDto` | Same fields, all optional |
| `QueryMessagesDto` | Optional filters + `cursor` + `limit` |

## Service: `findMany()`

Uses TypeORM QueryBuilder:

1. `leftJoinAndSelect` author for username in response
2. Optional `WHERE` clauses for tag, userId, date range
3. Keyset pagination: `WHERE (created_at, id) < (cursor)` ordered `DESC`
4. Returns `{ items, nextCursor }`

## Ownership guard

`MessageOwnerGuard`:

1. Loads message by `:id` param
2. Compares `message.authorId` with `req.user.id`
3. Returns `403 Forbidden` on mismatch

Applied on `PATCH` and `DELETE` only.

## Controller summary

```text
POST   /messages      JwtAuthGuard
GET    /messages      (public)
PATCH  /messages/:id  JwtAuthGuard + MessageOwnerGuard
DELETE /messages/:id  JwtAuthGuard + MessageOwnerGuard
```

## Tags enum

```typescript
General | Tech | Random | Announcement | Question
```

Defined in `backend/src/messages/enums/tag.enum.ts` (mirrored in frontend `lib/tags.ts`).

## Related notes

- [[Database/Schema and Migrations]]
- [[Database/Indexes]]
- [[Frontend/Components and Hooks]]
