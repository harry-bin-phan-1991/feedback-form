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
  createdAt: string;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
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

async function handleError(resp: Response): Promise<never> {
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

  return handleError(resp);
}

/**
 * GET /api/feedback?page&size
 * Returns a paginated list of feedback responses sorted by createdAt desc.
 */
async function getFeedbacksPage(page: number, size: number): Promise<PageResponse<FeedbackResponse>> {
  const url = `${getBaseUrl()}/api/feedback?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`;
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (resp.ok) {
    const raw = (await resp.json()) as unknown;
    if (Array.isArray(raw)) {
      const allItems = raw as FeedbackResponse[];
      const totalElements = allItems.length;
      const totalPages = Math.max(1, Math.ceil(totalElements / size));
      const start = Math.max(0, page * size);
      const end = Math.min(totalElements, start + size);
      const items = allItems.slice(start, end);
      const hasNext = page < totalPages - 1;

      return {
        items,
        page,
        size,
        totalElements,
        totalPages,
        hasNext
      };
    }

    const data = raw as PageResponse<FeedbackResponse>;
    return data;
  }

  return handleError(resp);
}

/**
 * Convenience: fetch first page and return items only (for legacy/simple uses).
 */
async function getFeedbacks(): Promise<FeedbackResponse[]> {
  const firstPage = await getFeedbacksPage(0, 10);
  return firstPage.items;
}

export const apiClient = {
  submitFeedback,
  getFeedbacks,
  getFeedbacksPage
};