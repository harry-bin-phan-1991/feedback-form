import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { FeedbackResponse, ApiError } from '../apiClient';

type FeedbackState = {
  submitting: boolean;
  lastResponse: FeedbackResponse | null;
  lastError: ApiError | null;
};

type FeedbackActions = {
  setSubmitting: (submitting: boolean) => void;
  setLastResponse: (resp: FeedbackResponse | null) => void;
  setLastError: (err: ApiError | null) => void;
  reset: () => void;
};

type Store = FeedbackState & FeedbackActions;

export const useFeedbackStore = create<Store>()(
  immer((set) => ({
    submitting: false,
    lastResponse: null,
    lastError: null,

    setSubmitting: (submitting) =>
      set((draft) => {
        draft.submitting = submitting;
      }),

    setLastResponse: (resp) =>
      set((draft) => {
        draft.lastResponse = resp;
      }),

    setLastError: (err) =>
      set((draft) => {
        draft.lastError = err;
      }),

    reset: () =>
      set((draft) => {
        draft.submitting = false;
        draft.lastResponse = null;
        draft.lastError = null;
      })
  }))
);