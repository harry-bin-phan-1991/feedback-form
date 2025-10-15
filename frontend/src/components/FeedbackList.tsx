import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '../apiClient';
import type { FeedbackResponse, PageResponse } from '../apiClient';

export default function FeedbackList() {
  const {
    data,
    error,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery<PageResponse<FeedbackResponse>>({
    queryKey: ['feedbacks'],
    initialPageParam: 0,
    queryFn: ({ pageParam = 0 }) => apiClient.getFeedbacksPage(pageParam as number, 10),
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    staleTime: 60_000,
    refetchOnWindowFocus: true
  });

  const items: FeedbackResponse[] = (data?.pages ?? [])
    .flatMap((p: unknown) => {
      const page = p as any;
      if (Array.isArray(page)) return page;
      if (Array.isArray(page?.items)) return page.items;
      return [];
    })
    .filter(Boolean) as FeedbackResponse[];



  return (
    <div className="card" aria-live="polite">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2>Recent Feedback</h2>
        <button className="button" onClick={() => void refetch()} disabled={isLoading || isFetchingNextPage}>Refresh</button>
      </div>

      {isLoading ? <div>Loading...</div> : null}
      {isError ? <div role="alert">Failed to load feedbacks: {(error as Error)?.message || 'Request failed'}</div> : null}

      <ul data-testid="feedback-list">
        {items.map((it) => (
          <li key={it.id} style={{ marginBottom: 8 }}>
            <div><strong>{it.name}</strong> <span style={{ color: '#666' }}>({it.createdAt})</span></div>
            <div>{it.message}</div>
          </li>
        ))}
        {items.length === 0 && !isLoading && !isError ? <li>No feedback yet.</li> : null}
      </ul>

      <div style={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
        {hasNextPage ? (
          <button className="button" onClick={() => void fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading more...' : 'Load more'}
          </button>
        ) : items.length > 0 ? <span>End of list</span> : null}
      </div>
    </div>
  );
}