---
tags:
  - operations
  - testing
  - qa
---

# Testing

## Backend unit tests

**Location:** `backend/src/**/*.spec.ts`

### MessagesService (`messages.service.spec.ts`)

Covers `create()`:

| Case | Expected |
|------|----------|
| Content > 240 chars | Rejection |
| Invalid tag | Rejection |
| Valid payload | Success with author in response |

Mocks the TypeORM repository — no database required.

```bash
cd backend && npm test
```

## Backend e2e tests

**Location:** `backend/test/app.e2e-spec.ts`

- Validates `POST /auth/register` rejects invalid payload (bad email, short password)

```bash
cd backend && npm run test:e2e
```

## Frontend component tests

**Location:** `frontend/app/components/MessageCard.test.tsx`

- Renders message content and author
- Toggles inline edit mode
- Calls update handler on save

Uses Jest + Testing Library + jsdom.

```bash
cd frontend && npm test
```

## Validation coverage (manual / integration)

DTOs enforce:

| Field | Rule |
|-------|------|
| Register email | Valid email |
| Register password | Min 8 chars |
| Register username | Min 3 chars |
| Message content | Max 240 chars |
| Message tag | Enum value |

Global `ValidationPipe` strips unknown properties.

## Related notes

- [[Backend/Messages Module]]
- [[Frontend/Components and Hooks]]
- [[How It Was Built/Development Phases]]
