import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MESSAGES } from '@/lib/api/client/constants';
import { getCsrfToken } from '@/lib/api/client/csrf';
import { ApiClientError } from '@/lib/api/client/errors';

describe('getCsrfToken', () => {
  const originalDocument = globalThis.document;

  beforeEach(() => {
    vi.stubGlobal('document', {
      get cookie() {
        return (globalThis as unknown as { __cookie?: string }).__cookie ?? '';
      },
      set cookie(value: string) {
        (globalThis as unknown as { __cookie?: string }).__cookie = value;
      },
    });
  });

  afterEach(() => {
    vi.stubGlobal('document', originalDocument);
    delete (globalThis as unknown as { __cookie?: string }).__cookie;
  });

  it('returns undefined when document is undefined', () => {
    vi.stubGlobal('document', undefined);
    expect(getCsrfToken()).toBeUndefined();
  });

  it('returns undefined when cookie is empty', () => {
    (globalThis as unknown as { __cookie: string }).__cookie = '';
    expect(getCsrfToken()).toBeUndefined();
  });

  it('returns token value when XSRF-TOKEN cookie is present', () => {
    (globalThis as unknown as { __cookie: string }).__cookie =
      'XSRF-TOKEN=abc123; path=/';
    expect(getCsrfToken()).toBe('abc123');
  });

  it('returns token when cookie string has multiple parts', () => {
    (globalThis as unknown as { __cookie: string }).__cookie =
      'other=value; XSRF-TOKEN=token456; path=/';
    expect(getCsrfToken()).toBe('token456');
  });

  it('handles decoded cookie (no %-encoding)', () => {
    (globalThis as unknown as { __cookie: string }).__cookie =
      'XSRF-TOKEN=plain-token';
    expect(getCsrfToken()).toBe('plain-token');
  });

  it('returns undefined when decodeURIComponent throws', () => {
    const doc = {
      get cookie() {
        return 'XSRF-TOKEN=bad%';
      },
    };
    vi.stubGlobal('document', doc);
    expect(getCsrfToken()).toBeUndefined();
  });
});

describe('ensureCsrfCookie', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.stubGlobal('document', {
      get cookie() {
        return '';
      },
      set cookie(_value: string) {},
    });
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.stubGlobal('fetch', originalFetch);
    vi.stubGlobal('document', globalThis.document);
  });

  it('resets in-flight promise on fetch failure so a retry can succeed', async () => {
    const { ensureCsrfCookie } = await import('@/lib/api/client/csrf');
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(new Response() as Response);

    const firstCall = ensureCsrfCookie();
    const err = await firstCall.catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiClientError);
    expect((err as ApiClientError).message).toBe(MESSAGES.CSRF_COOKIE_FAILED);

    const secondCall = ensureCsrfCookie();
    await expect(secondCall).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
