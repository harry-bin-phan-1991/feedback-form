/**
 * API request/response contracts
 */
export type FeedbackRequest = {
  name: string;
  email: string;
  message: string;
};

export type FeedbackResponse = {
  id: number;
  name: string;
  message: string;
};

export type ApiError = {
  timestamp?: string;
  status: number;
  error?: string;
  message?: string;
  details?: string[];
};

/**
 * HttpError carries HTTP status and an optional structured error body
 * to be handled by UI code.
 */
export class HttpError extends Error {
  status: number;
  body?: ApiError;

  constructor(message: string, status: number, body?: ApiError) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

/**
 * Resolve API base URL from Vite env, with sensible default for local dev.
 */
function getBaseUrl(): string {
  const fromEnv = import.meta?.env?.VITE_API_URL;
  return typeof fromEnv === 'string' && fromEnv.length > 0 ? fromEnv : 'http://localhost:8080';
}

/**
 * POST /api/feedback
 * Submits feedback and returns a sanitized response that excludes sensitive fields.
 */
async function submitFeedback(dto: FeedbackRequest): Promise<FeedbackResponse> {
  const url = `${getBaseUrl()}/api/feedback`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dto)
  });

  if (resp.ok) {
    const data = (await resp.json()) as FeedbackResponse;
    return data;
  }

  let body: ApiError | undefined;
  try {
    body = (await resp.json()) as ApiError;
  } catch {
  }

  const message =
    body?.message ||
    body?.error ||
    resp.statusText ||
    'Request failed';

  throw new HttpError(message, resp.status, body);
}

export const apiClient = {
  submitFeedback
};