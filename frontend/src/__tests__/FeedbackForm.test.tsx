import React from 'react';
import type { Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ToastProvider from '../components/ToastProvider';
import FeedbackForm from '../components/FeedbackForm';

vi.mock('../apiClient', () => {
  return {
    apiClient: {
      submitFeedback: vi.fn()
    }
  };
});

import { apiClient } from '../apiClient';

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{ui}</ToastProvider>
    </QueryClientProvider>
  );
}

describe('FeedbackForm', () => {
  it('submits successfully and shows success toast', async () => {
    (apiClient.submitFeedback as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 1,
      name: 'John Doe',
      message: 'Your platform looks great!'
    });

    renderWithProviders(<FeedbackForm />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Your platform looks great!' } });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(apiClient.submitFeedback).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Your platform looks great!'
      });
    });

    expect(await screen.findByText(/feedback sent/i)).toBeInTheDocument();
    expect(await screen.findByText(/thanks john doe!/i)).toBeInTheDocument();
  });

  it('shows validation error toast on 400 error with details', async () => {
    const error = Object.assign(new Error('Validation error'), {
      status: 400,
      body: {
        status: 400,
        message: 'Validation error',
        details: ['name must not be blank', 'email must be a well-formed email address']
      }
    });
    (apiClient.submitFeedback as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);

    renderWithProviders(<FeedbackForm />);

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Hello' } });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText(/submission failed/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/name must not be blank/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/email must be a well-formed email address/i)
    ).toBeInTheDocument();
  });
});