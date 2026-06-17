'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchMessages, MessagesListResponse } from '../lib/api';

export interface MessageFeedFilters {
  tag?: string;
  userId?: string;
  from?: string;
  to?: string;
}

const PAGE_SIZE = 20;

export function useMessagesFeed(filters: MessageFeedFilters) {
  return useInfiniteQuery({
    queryKey: ['messages', filters],
    queryFn: ({ pageParam }) =>
      fetchMessages({
        ...filters,
        cursor: pageParam,
        limit: PAGE_SIZE,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: MessagesListResponse) =>
      lastPage.nextCursor ?? undefined,
  });
}
