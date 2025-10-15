import { describe, it, expect, vi } from 'vitest';
import type { Mock } from 'vitest';
import { apiClient, HttpError } from '../apiClient';

const dto = {
  name: 'John Doe',
  email: 'john@example.com',
  message: 'Your platform looks great!'
};

describe('apiClient.submitFeedback', () => {
  it('returns data on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: vi.fn().mockResolvedValue({
        id: 1,
        name: 'John Doe',
        message: 'Your platform looks great!',
        createdAt: '2024-01-01T00:00:00Z'
      })
    }));

    const resp = await apiClient.submitFeedback(dto);
    expect(resp).toEqual({
      id: 1,
      name: 'John Doe',
      message: 'Your platform looks great!',
      createdAt: '2024-01-01T00:00:00Z'
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    const mockFetch = fetch as unknown as Mock;
    const calls = mockFetch.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const firstCall = calls[0]! ?? [];
    const urlArg = firstCall[0] as string;
    expect(urlArg).toMatch(/http:\/\/localhost:8080\/api\/feedback$/);
  });

  it('throws HttpError with structured body on 400 validation error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: vi.fn().mockResolvedValue({
        status: 400,
        message: 'Validation error',
        details: ['name must not be blank', 'email must be a well-formed email address']
      })
    }));

    await expect(apiClient.submitFeedback(dto)).rejects.toMatchObject({
      name: 'HttpError',
      status: 400
    });

    try {
      await apiClient.submitFeedback(dto);
    } catch (e) {
      const err = e as HttpError;
      expect(err).toBeInstanceOf(HttpError);
      expect(err.status).toBe(400);
      expect(err.body?.message).toBe('Validation error');
      expect(err.body?.details).toContain('name must not be blank');
      expect(err.body?.details).toContain('email must be a well-formed email address');
    }
  });

  it('falls back to statusText when error body is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: vi.fn().mockRejectedValue(new Error('invalid json'))
    }));

    try {
      await apiClient.submitFeedback(dto);
      expect(true).toBe(false);
    } catch (e) {
      const err = e as HttpError;
      expect(err).toBeInstanceOf(HttpError);
      expect(err.status).toBe(500);
      expect(err.message).toBe('Internal Server Error');
      expect(err.body).toBeUndefined();
    }
  });
});

describe('apiClient.getFeedbacksPage', () => {
  it('returns paginated list on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: vi.fn().mockResolvedValue({
        items: [
          { id: 2, name: 'Alice', message: 'Hi', createdAt: '2024-02-01T00:00:00Z' },
          { id: 1, name: 'Bob', message: 'Hello', createdAt: '2024-01-01T00:00:00Z' }
        ],
        page: 0,
        size: 10,
        totalElements: 2,
        totalPages: 1,
        hasNext: false
      })
    }));

    const page = await apiClient.getFeedbacksPage(0, 10);
    expect(page.items).toHaveLength(2);

    const [first, second] = page.items;
    expect(first).toBeDefined();
    expect(second).toBeDefined();

    expect(first!.id).toBe(2);
    expect(first!.createdAt).toBe('2024-02-01T00:00:00Z');
    expect(second!.id).toBe(1);

    const mockFetch = fetch as unknown as Mock;
    const calls = mockFetch.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const call = calls[0]!;
    expect(call[1]?.method).toBe('GET');
    expect((call[0] as string)).toMatch(/http:\/\/localhost:8080\/api\/feedback\?page=0&size=10$/);
  });

  it('throws HttpError on server error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: vi.fn().mockRejectedValue(new Error('invalid json'))
    }));

    await expect(apiClient.getFeedbacksPage(0, 10)).rejects.toBeInstanceOf(HttpError);
  });
});

describe('apiClient.getFeedbacks (legacy convenience)', () => {
  it('maps first page items', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: vi.fn().mockResolvedValue({
        items: [
          { id: 2, name: 'Alice', message: 'Hi', createdAt: '2024-02-01T00:00:00Z' },
          { id: 1, name: 'Bob', message: 'Hello', createdAt: '2024-01-01T00:00:00Z' }
        ],
        page: 0,
        size: 10,
        totalElements: 2,
        totalPages: 1,
        hasNext: false
      })
    }));

    const list = await apiClient.getFeedbacks();
    expect(list).toHaveLength(2);

    const mockFetch = fetch as unknown as Mock;
    const calls = mockFetch.mock.calls;
    const call = calls[0]!;
    expect((call[0] as string)).toMatch(/http:\/\/localhost:8080\/api\/feedback\?page=0&size=10$/);
  });
});