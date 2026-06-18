---
tags:
  - frontend
  - components
  - react
---

# Components and Hooks

## Components

| Component | Purpose |
|-----------|---------|
| `MessageCard` | Displays message; inline edit/delete for owner |
| `MessageComposer` | New message form with 240-char counter + tag selector |
| `FilterBar` | Tag, author ID, date range filters |
| `TagBadge` | Colored tag label |
| `InfiniteScrollSentinel` | IntersectionObserver trigger for next page |
| `QueryProvider` | React Query client wrapper |

### MessageCard behavior

- Shows author username, tag badge, timestamp, content
- If `message.authorId === currentUser.id`:
  - **Edit** — swaps to textarea with char counter, Save/Cancel
  - **Delete** — calls delete mutation
- Non-owners see read-only card

### FilterBar behavior

- Draft filter state vs applied filters (Apply button)
- Tag dropdown from fixed enum
- Author ID (UUID text input)
- Date from / date to pickers

## Hooks

| Hook | Purpose |
|------|---------|
| `useAuth` | Re-exports `AuthContext` (user, login, register, logout) |
| `useMessagesFeed` | `useInfiniteQuery` for paginated messages |
| `useMessageMutations` | `updateMessage`, `deleteMessage` with cache invalidation |

### useMessagesFeed

- Accepts `MessageFeedFilters` (tag, userId, from, to)
- Fetches pages via `GET /messages?cursor=...`
- Exposes `fetchNextPage`, `hasNextPage`, loading states

### useMessageMutations

- Wraps PATCH/DELETE API calls
- Tracks `updatingId` / `deletingId` for per-card loading UI
- Invalidates feed queries on success

## API client (`lib/api.ts`)

- Module-level `accessToken` variable (not localStorage)
- `apiFetch()` attaches Bearer token, retries on 401 via refresh
- `restoreSession()` on app mount for silent login

## Tests

`MessageCard.test.tsx` — verifies inline edit mode toggle and update handler.

Run: `cd frontend && npm test`

## Related notes

- [[Frontend/Next.js Structure]]
- [[Backend/Messages Module]]
- [[Operations/Testing]]
