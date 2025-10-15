import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import * as Toast from '@radix-ui/react-toast';

type ToastVariant = 'success' | 'error' | 'info';

export type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms
};

type ToastContextValue = {
  showToast: (opts: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Required<Pick<ToastOptions, 'title'>> & Partial<ToastOptions>>({
    title: '',
    description: '',
    variant: 'info',
    duration: 4000
  });

  const showToast = useCallback((opts: ToastOptions) => {
    setOptions((prev) => ({
      ...prev,
      ...opts,
      variant: opts.variant ?? 'info',
      duration: opts.duration ?? 4000
    }));
    setOpen(false);
    setTimeout(() => setOpen(true), 0);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  const variantClass =
    options.variant === 'success'
      ? 'toast-success'
      : options.variant === 'error'
      ? 'toast-error'
      : 'toast-info';

  return (
    <ToastContext.Provider value={value}>
      <Toast.Provider swipeDirection="right">
        {children}
        <Toast.Root
          className={`toast ${variantClass}`}
          open={open}
          onOpenChange={setOpen}
          duration={options.duration}
        >
          {options.title ? <Toast.Title className="toast-title">{options.title}</Toast.Title> : null}
          {options.description ? (
            <Toast.Description className="toast-description">
              {options.description}
            </Toast.Description>
          ) : null}
          <Toast.Close className="toast-close" aria-label="Close">×</Toast.Close>
        </Toast.Root>
        <Toast.Viewport className="toast-viewport" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}

export default ToastProvider;