import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildRequestHeaders,
  resolveApiUrl,
  serializeRequestBody,
} from '@/lib/api/client/build';

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
  getCsrfToken: vi.fn(),
}));

const { getCsrfToken } = await import('@/lib/api/client/csrf');

describe('resolveApiUrl', () => {
  it('resolves versioned API path to version endpoint', () => {
    expect(resolveApiUrl('users')).toBe('https://api.test.com/v1/users');
    expect(resolveApiUrl('users/1')).toBe('https://api.test.com/v1/users/1');
  });

  it('normalizes leading slash from endpoint', () => {
    expect(resolveApiUrl('/users')).toBe('https://api.test.com/v1/users');
  });

  it('trims whitespace from endpoint', () => {
    expect(resolveApiUrl('  users  ')).toBe('https://api.test.com/v1/users');
  });

  it('resolves Sanctum endpoints to domain endpoint without version', () => {
    expect(resolveApiUrl('sanctum/csrf-cookie')).toBe(
      'https://api.test.com/sanctum/csrf-cookie',
    );
    expect(resolveApiUrl('/sanctum/csrf-cookie')).toBe(
      'https://api.test.com/sanctum/csrf-cookie',
    );
  });

  it('strips surrounding whitespace from path so Sanctum detection works', () => {
    expect(resolveApiUrl('  sanctum/csrf-cookie  ')).toBe(
      'https://api.test.com/sanctum/csrf-cookie',
    );
  });

  it('throws when endpoint is an absolute http URL', () => {
    expect(() => resolveApiUrl('http://evil.com/path')).toThrow(
      /API client does not accept absolute URLs/,
    );
  });

  it('throws when endpoint is an absolute https URL', () => {
    expect(() => resolveApiUrl('https://evil.com/path')).toThrow(
      /API client does not accept absolute URLs/,
    );
  });

  it('throws when endpoint is protocol-relative URL', () => {
    expect(() => resolveApiUrl('//evil.com/path')).toThrow(
      /API client does not accept absolute URLs/,
    );
  });
});

describe('buildRequestHeaders', () => {
  beforeEach(() => {
    vi.mocked(getCsrfToken).mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('always includes Accept application/json', () => {
    const headers = buildRequestHeaders('GET', {});
    expect(headers['Accept']).toBe('application/json');
  });

  it('does not add X-XSRF-TOKEN for GET when no token is present', () => {
    vi.mocked(getCsrfToken).mockReturnValue(undefined);
    const headers = buildRequestHeaders('GET', {});
    expect(headers['X-XSRF-TOKEN']).toBeUndefined();
  });

  it('adds X-XSRF-TOKEN for non-GET when token is present', () => {
    vi.mocked(getCsrfToken).mockReturnValue('csrf-token-123');
    const headers = buildRequestHeaders('POST', {});
    expect(headers['X-XSRF-TOKEN']).toBe('csrf-token-123');
  });

  it('merges custom headers from init', () => {
    const headers = buildRequestHeaders('GET', {
      headers: { 'X-Custom': 'value' },
    });
    expect(headers['Accept']).toBe('application/json');
    expect(headers['X-Custom']).toBe('value');
  });

  it('accepts Headers instance and converts to record', () => {
    const inputHeaders = new Headers();
    inputHeaders.set('X-Requested-With', 'XMLHttpRequest');
    const headers = buildRequestHeaders('GET', { headers: inputHeaders });
    expect(headers['Accept']).toBe('application/json');
    expect(headers['x-requested-with']).toBe('XMLHttpRequest');
  });
});

describe('serializeRequestBody', () => {
  it('returns undefined body and contentTypeSet false when body is undefined', () => {
    const headers: Record<string, string> = {};
    const result = serializeRequestBody(undefined, headers);
    expect(result.body).toBeUndefined();
    expect(result.contentTypeSet).toBe(false);
    expect(headers['Content-Type']).toBeUndefined();
  });

  it('passes through string body without setting Content-Type', () => {
    const headers: Record<string, string> = {};
    const result = serializeRequestBody('raw string', headers);
    expect(result.body).toBe('raw string');
    expect(result.contentTypeSet).toBe(false);
  });

  it('passes through FormData without setting Content-Type', () => {
    const headers: Record<string, string> = {};
    const form = new FormData();
    form.append('key', 'value');
    const result = serializeRequestBody(form, headers);
    expect(result.body).toBe(form);
    expect(result.contentTypeSet).toBe(false);
  });

  it('passes through URLSearchParams without setting Content-Type', () => {
    const headers: Record<string, string> = {};
    const params = new URLSearchParams({ a: '1', b: '2' });
    const result = serializeRequestBody(params, headers);
    expect(result.body).toBe(params);
    expect(result.contentTypeSet).toBe(false);
  });

  it('serializes plain object as JSON and sets Content-Type', () => {
    const headers: Record<string, string> = {};
    const result = serializeRequestBody({ name: 'Test', count: 42 }, headers);
    expect(result.body).toBe(JSON.stringify({ name: 'Test', count: 42 }));
    expect(result.contentTypeSet).toBe(true);
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('builds FormData when object contains a File', () => {
    const headers: Record<string, string> = {};
    const file = new File(['content'], 'file.txt', { type: 'text/plain' });
    const result = serializeRequestBody(
      { name: 'Test', file, extra: 'value' },
      headers,
    );
    expect(result.body).toBeInstanceOf(FormData);
    expect(result.contentTypeSet).toBe(false);
    const form = result.body as FormData;
    expect(form.get('name')).toBe('Test');
    expect(form.get('file')).toBe(file);
    expect(form.get('extra')).toBe('value');
  });

  it('omits null and undefined values when building FormData from object with File', () => {
    const headers: Record<string, string> = {};
    const file = new File([], 'f');
    const result = serializeRequestBody(
      { a: null, b: undefined, file } as Record<string, unknown>,
      headers,
    );
    const form = result.body as FormData;
    expect(form.has('a')).toBe(false);
    expect(form.has('b')).toBe(false);
    expect(form.get('file')).toBe(file);
  });
});
