import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { client } from '@/lib/api/client/core';

vi.mock('@/lib/api/client/config', () => ({
  api: {
    get versionEndpoint(): string {
      return 'https://api.test.com/v1';
    },
    get domainEndpoint(): string {
      return 'https://api.test.com';
    },
  },
}));

vi.mock('@/lib/api/client/csrf', () => ({
  getCsrfToken: vi.fn(() => undefined),
  ensureCsrfCookie: vi.fn(() => Promise.resolve()),
}));

describe('client', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('fetch not mocked'))),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves with success data for 200 JSON response', async () => {
    const data = { id: 1, name: 'Test' };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'success', message: 'OK', data }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const res = await client<{ id: number; name: string }>('users/1', {
      method: 'GET',
    });

    expect(res.status).toBe('success');
    if (res.status === 'success') {
      expect(res.data).toEqual(data);
    }
    expect(fetch).toHaveBeenCalledWith(
      'https://api.test.com/v1/users/1',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      }),
    );
  });

  it('returns success with undefined data for 204 No Content', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));

    const res = await client<undefined>('users/1', { method: 'DELETE' });

    expect(res.status).toBe('success');
    if (res.status === 'success') {
      expect(res.data).toBeUndefined();
    }
  });

  it('throws ApiClientError for backend error when throwOnError is true', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          status: 'error',
          message: 'Not found',
          errors: {},
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const { ApiClientError } = await import('@/lib/api/client/errors');
    try {
      await client('users/999', { method: 'GET' });
      expect.fail('expected client to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiClientError);
      expect((err as InstanceType<typeof ApiClientError>).message).toBe(
        'Not found',
      );
      expect((err as InstanceType<typeof ApiClientError>).status).toBe(404);
    }
  });

  it('returns error response when throwOnError is false and backend returns error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          status: 'error',
          message: 'Validation failed',
          errors: { email: ['Invalid'] },
        }),
        { status: 422, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const res = await client<unknown>('users', {
      method: 'POST',
      body: {},
      throwOnError: false,
    });

    expect(res.status).toBe('error');
    if (res.status === 'error') {
      expect(res.message).toBe('Validation failed');
      expect(res.errors).toEqual({ email: ['Invalid'] });
    }
  });

  it('throws ApiClientError on network failure when throwOnError is true', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    const { ApiClientError } = await import('@/lib/api/client/errors');
    await expect(client('users', { method: 'GET' })).rejects.toThrow(
      ApiClientError,
    );
  });

  it('returns error response on network failure when throwOnError is false', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    const res = await client<unknown>('users', {
      method: 'GET',
      throwOnError: false,
    });

    expect(res.status).toBe('error');
    expect(res.message).toContain('network');
  });

  it('sends POST body as JSON with correct headers', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          status: 'success',
          message: 'Created',
          data: { id: 1 },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await client<{ id: number }>('users', {
      method: 'POST',
      body: { name: 'Alice' },
    });

    expect(fetch).toHaveBeenCalledWith(
      'https://api.test.com/v1/users',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Alice' }),
        headers: expect.objectContaining({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
      }),
    );
  });
});
