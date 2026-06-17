'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  EMPTY_FILTER_VALUES,
  FilterBar,
  FilterBarValues,
} from '../components/FilterBar';
import { InfiniteScrollSentinel } from '../components/InfiniteScrollSentinel';
import { MessageCard } from '../components/MessageCard';
import { useAuth } from '../hooks/useAuth';
import { useMessageMutations } from '../hooks/useMessageMutations';
import {
  MessageFeedFilters,
  useMessagesFeed,
} from '../hooks/useMessagesFeed';

function toAppliedFilters(values: FilterBarValues): MessageFeedFilters {
  return {
    tag: values.tag || undefined,
    userId: values.userId || undefined,
    from: values.dateFrom
      ? `${values.dateFrom}T00:00:00.000Z`
      : undefined,
    to: values.dateTo ? `${values.dateTo}T23:59:59.999Z` : undefined,
  };
}

export default function MessagesPage() {
  const { user, logout } = useAuth();
  const [draftFilters, setDraftFilters] =
    useState<FilterBarValues>(EMPTY_FILTER_VALUES);
  const [appliedFilters, setAppliedFilters] = useState<MessageFeedFilters>({});

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useMessagesFeed(appliedFilters);

  const { updateMessage, deleteMessage, updatingId, deletingId } =
    useMessageMutations(appliedFilters);

  const messages = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(toAppliedFilters(draftFilters));
  }, [draftFilters]);

  const handleResetFilters = useCallback(() => {
    setDraftFilters(EMPTY_FILTER_VALUES);
    setAppliedFilters({});
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <header className="flex items-center justify-between border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Messages</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Signed in as {user?.username ?? user?.email}
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Sign out
        </button>
      </header>

      <div className="mt-8 space-y-6">
        <FilterBar
          values={draftFilters}
          onChange={setDraftFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />

        {isLoading ? (
          <p className="text-sm text-zinc-600">Loading messages…</p>
        ) : error ? (
          <p className="text-sm text-red-600" role="alert">
            {error instanceof Error ? error.message : 'Failed to load messages'}
          </p>
        ) : messages.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-600">
            No messages match your filters.
          </p>
        ) : (
          <ul className="space-y-4">
            {messages.map((message) => (
              <li key={message.id}>
                <MessageCard
                  message={message}
                  currentUserId={user?.id}
                  onUpdate={updateMessage}
                  onDelete={deleteMessage}
                  isUpdating={updatingId === message.id}
                  isDeleting={deletingId === message.id}
                />
              </li>
            ))}
          </ul>
        )}

        <InfiniteScrollSentinel
          onIntersect={handleLoadMore}
          isLoading={isFetchingNextPage}
          hasMore={Boolean(hasNextPage)}
        />

        {isFetching && !isLoading && !isFetchingNextPage ? (
          <p className="text-center text-xs text-zinc-500">Refreshing…</p>
        ) : null}
      </div>
    </div>
  );
}
