import React from 'react';
import type { Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FeedbackList from '../components/FeedbackList';

vi.mock('../apiClient', () => {
  return {
    apiClient: {
      getFeedbacksPage: vi.fn()
    }
  };
});

import { apiClient } from '../apiClient';

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('FeedbackList', () => {
  it('loads and displays feedback items with timestamps (first page)', async () => {
    (apiClient.getFeedbacksPage as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      items: [
        { id: 2, name: 'Alice', message: 'Hi', createdAt: '2024-02-01T00:00:00Z' },
        { id: 1, name: 'Bob', message: 'Hello', createdAt: '2024-01-01T00:00:00Z' }
      ],
      page: 0,
      size: 10,
      totalElements: 2,
      totalPages: 1,
      hasNext: false
    });

    renderWithProviders(<FeedbackList />);

    expect(await screen.findByRole('heading', { name: /recent feedback/i, level: 2 })).toBeInTheDocument();

    const list = await screen.findByTestId('feedback-list');
    expect(list).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/alice/i)).toBeInTheDocument();
      expect(screen.getByText(/\(2024-02-01T00:00:00Z\)/i)).toBeInTheDocument();
      expect(screen.getByText(/bob/i)).toBeInTheDocument();
      expect(screen.getByText(/\(2024-01-01T00:00:00Z\)/i)).toBeInTheDocument();
      expect(screen.getByText(/hi/i)).toBeInTheDocument();
      expect(screen.getByText(/hello/i)).toBeInTheDocument();
    });
  });

  it('shows error when loading fails', async () => {
    (apiClient.getFeedbacksPage as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      Object.assign(new Error('Internal Server Error'), { status: 500 })
    );

    renderWithProviders(<FeedbackList />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/failed to load feedbacks/i);
  });

  it('shows empty state when no items returned', async () => {
    (apiClient.getFeedbacksPage as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      hasNext: false
    });
  
    renderWithProviders(<FeedbackList />);
  
    await screen.findByRole('heading', { name: /recent feedback/i, level: 2 });
  
    expect(await screen.findByText(/no feedback yet/i)).toBeInTheDocument();
  });

  it('invokes initial page fetch with page=0 and size=10', async () => {
    (apiClient.getFeedbacksPage as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      hasNext: false
    });

    renderWithProviders(<FeedbackList />);

    await screen.findByRole('heading', { name: /recent feedback/i, level: 2 });

    const calls = (apiClient.getFeedbacksPage as unknown as Mock).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const [pageArg, sizeArg] = calls[0]!;
    expect(pageArg).toBe(0);
    expect(sizeArg).toBe(10);
  });

  it('normalizes pages containing bare arrays of items', async () => {
    (apiClient.getFeedbacksPage as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { id: 2, name: 'Alice', message: 'Hi', createdAt: '2024-02-01T00:00:00Z' },
      { id: 1, name: 'Bob', message: 'Hello', createdAt: '2024-01-01T00:00:00Z' }
    ]);

    renderWithProviders(<FeedbackList />);

    await screen.findByRole('heading', { name: /recent feedback/i, level: 2 });

    await waitFor(() => {
      expect(screen.getByText(/alice/i)).toBeInTheDocument();
      expect(screen.getByText(/\(2024-02-01T00:00:00Z\)/i)).toBeInTheDocument();
      expect(screen.getByText(/bob/i)).toBeInTheDocument();
      expect(screen.getByText(/\(2024-01-01T00:00:00Z\)/i)).toBeInTheDocument();
      expect(screen.getByText(/hi/i)).toBeInTheDocument();
      expect(screen.getByText(/hello/i)).toBeInTheDocument();
    });
  });
});