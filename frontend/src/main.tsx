import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.scss';
import ToastProvider from './components/ToastProvider';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </QueryClientProvider>
  </React.StrictMode>
);