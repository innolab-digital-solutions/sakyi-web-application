import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getServerBlogPost,
  getServerBlogPosts,
} from '@/lib/api/server/marketing';

const mockFetch = (response: Partial<Response>) => {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('marketing server API', () => {
  it('requests JSON, because the API answers 406 otherwise', async () => {
    const fetchMock = mockFetch({
      ok: true,
      json: async () => ({ data: { title: 'Post' } }),
    });

    await expect(getServerBlogPost('a-post')).resolves.toEqual({
      title: 'Post',
    });
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      headers: { Accept: 'application/json' },
    });
  });

  it('encodes the slug in the request path', async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => ({ data: {} }) });

    await getServerBlogPost('a&b');

    expect(fetchMock.mock.calls[0]?.[0]).toContain('/blog-posts/a%26b?');
  });

  it('resolves to null on an error response', async () => {
    mockFetch({ ok: false, status: 406 });

    await expect(getServerBlogPost('a-post')).resolves.toBeNull();
  });

  it('resolves to null when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(getServerBlogPost('a-post')).resolves.toBeNull();
  });

  it('requests a limit so the list is not cut to one page', async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => ({ data: [] }) });

    await expect(getServerBlogPosts()).resolves.toEqual([]);
    expect(fetchMock.mock.calls[0]?.[0]).toContain('limit=');
  });

  it('falls back to an empty list on failure', async () => {
    mockFetch({ ok: false, status: 500 });

    await expect(getServerBlogPosts()).resolves.toEqual([]);
  });
});
