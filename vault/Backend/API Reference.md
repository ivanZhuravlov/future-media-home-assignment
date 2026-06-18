---
tags:
  - backend
  - api
---

# API Reference

Base URL (direct): `http://localhost:3001`  
Via frontend proxy: `http://localhost:3000/api`

## Auth endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | No | Create account; returns access token + sets refresh cookie |
| `POST` | `/auth/login` | No | Login; returns access token + sets refresh cookie |
| `POST` | `/auth/refresh` | Refresh cookie | Issue new access token |

### Register / Login body

```json
{
  "email": "user@example.com",
  "username": "myuser",
  "password": "password123"
}
```

Login omits `username`.

### Response

```json
{
  "accessToken": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "myuser"
  }
}
```

---

## Message endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/messages` | No | List messages (paginated, filterable) |
| `POST` | `/messages` | Bearer JWT | Create message |
| `PATCH` | `/messages/:id` | Bearer JWT + owner | Update message |
| `DELETE` | `/messages/:id` | Bearer JWT + owner | Delete message |

### Create message body

```json
{
  "content": "Hello world",
  "tag": "General"
}
```

Valid tags: `General`, `Tech`, `Random`, `Announcement`, `Question`

### Query parameters (`GET /messages`)

| Param | Type | Description |
|-------|------|-------------|
| `tag` | string | Filter by tag enum |
| `userId` | UUID | Filter by author |
| `from` | ISO date | Created on or after |
| `to` | ISO date | Created on or before |
| `cursor` | string | Pagination cursor from previous response |
| `limit` | number | Page size |

### List response

```json
{
  "items": [
    {
      "id": "uuid",
      "content": "Hello",
      "tag": "General",
      "authorId": "uuid",
      "author": { "id": "uuid", "username": "myuser" },
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "nextCursor": "base64cursor or null"
}
```

---

## Error responses

Validation and HTTP errors return a consistent shape (when using the global filter):

```json
{
  "statusCode": 400,
  "message": ["content must be shorter than or equal to 240 characters"],
  "error": "Bad Request",
  "timestamp": "...",
  "path": "/messages"
}
```

Common status codes:
- `401` — Missing or invalid JWT
- `403` — Not message owner (PATCH/DELETE)
- `409` — Email or username already taken (register)

## Related notes

- [[Backend/Authentication]]
- [[Backend/Messages Module]]
- [[Getting Started/Login and Credentials]]
