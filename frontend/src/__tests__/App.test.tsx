import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';
import ToastProvider from '../components/ToastProvider';

function renderWithProviders(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe('App', () => {
  it('renders heading and feedback form fields', () => {
    renderWithProviders(<App />);

    expect(
      screen.getByRole('heading', {
        name: /feedback app/i,
        level: 1
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/submit your feedback below/i)
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /submit/i })
    ).toBeInTheDocument();
  });
});