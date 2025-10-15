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
        message: 'Your platform looks great!'
      })
    }));

    const resp = await apiClient.submitFeedback(dto);
    expect(resp).toEqual({
      id: 1,
      name: 'John Doe',
      message: 'Your platform looks great!'
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