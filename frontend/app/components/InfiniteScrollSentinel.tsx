'use client';

import { useEffect, useRef } from 'react';

interface InfiniteScrollSentinelProps {
  onIntersect: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
}

export function InfiniteScrollSentinel({
  onIntersect,
  isLoading = false,
  hasMore = true,
}: InfiniteScrollSentinelProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading) {
      return;
    }

    const element = sentinelRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onIntersect();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [onIntersect, hasMore, isLoading]);

  if (!hasMore) {
    return null;
  }

  return (
    <div
      ref={sentinelRef}
      className="py-6 text-center text-sm text-zinc-500"
      aria-hidden={!isLoading}
    >
      {isLoading ? 'Loading more messages…' : ''}
    </div>
  );
}
