import { describe, expect, it } from 'vitest';

import { MESSAGES } from '@/lib/api/client/constants';
import { ApiClientError } from '@/lib/api/client/errors';
import {
  handleBackendError,
  handleJsonParseFailure,
  handleNetworkFailure,
  handleNoContent,
  handleNonJson,
  toErrorResponse,
} from '@/lib/api/client/handlers';

describe('toErrorResponse', () => {
  it('returns error response with message and optional errors', () => {
    const res = toErrorResponse<unknown>('Something went wrong');
    expect(res.status).toBe('error');
    expect(res.message).toBe('Something went wrong');
    expect(res.errors).toBeUndefined();
  });

  it('includes errors when provided', () => {
    const errors = { field: ['Invalid'] };
    const res = toErrorResponse<unknown>('Validation failed', errors);
    expect(res.status).toBe('error');
    expect(res.errors).toEqual(errors);
  });
});

describe('handleNetworkFailure', () => {
  it('returns error response when throwOnError is false', async () => {
    const res = await handleNetworkFailure<unknown>(
      new Error('Network error'),
      false,
    );
    expect(res.status).toBe('error');
    expect(res.message).toBe(MESSAGES.NETWORK_ERROR);
    expect(res.errors).toEqual({ network: ['Error: Network error'] });
  });

  it('throws ApiClientError when throwOnError is true', async () => {
    await expect(
      handleNetworkFailure<unknown>(new Error('Network error'), true),
    ).rejects.toThrow(ApiClientError);
    await expect(
      handleNetworkFailure<unknown>(new Error('Network error'), true),
    ).rejects.toMatchObject({
      message: MESSAGES.NETWORK_ERROR,
      status: 0,
    });
  });
});

describe('handleNonJson', () => {
  it('returns success response with raw text when response is ok', () => {
    const response = new Response('plain text', { status: 200 });
    const res = handleNonJson<string>(response, 'plain text');
    expect(res.status).toBe('success');
    expect(res.message).toBe(MESSAGES.SUCCESS);
    expect(res.data).toBe('plain text');
  });

  it('returns error response when response is not ok', () => {
    const response = new Response('Not Found', { status: 404 });
    const res = handleNonJson<unknown>(response, 'Not Found');
    expect(res.status).toBe('error');
    expect(res.message).toBe(response.statusText);
    expect(res.data).toBe('Not Found');
  });
});

describe('handleNoContent', () => {
  it('returns success response with undefined data', () => {
    const res = handleNoContent<undefined>();
    expect(res.status).toBe('success');
    expect(res.message).toBe(MESSAGES.SUCCESS);
    expect(res.data).toBeUndefined();
  });
});

describe('handleJsonParseFailure', () => {
  it('returns error response when throwOnError is false', async () => {
    const response = new Response('not json', { status: 200 });
    const res = await handleJsonParseFailure<unknown>(response, false);
    expect(res.status).toBe('error');
    expect(res.message).toBe(MESSAGES.INVALID_JSON);
  });

  it('throws ApiClientError when throwOnError is true', async () => {
    const response = new Response('not json', { status: 200 });
    await expect(
      handleJsonParseFailure<unknown>(response, true),
    ).rejects.toThrow(ApiClientError);
    await expect(
      handleJsonParseFailure<unknown>(response, true),
    ).rejects.toMatchObject({
      message: MESSAGES.INVALID_JSON,
      status: 200,
    });
  });
});

describe('handleBackendError', () => {
  it('returns error response when throwOnError is false', () => {
    const response = new Response(null, {
      status: 422,
      statusText: 'Unprocessable',
    });
    const payload = {
      status: 'error' as const,
      message: 'Validation failed',
      errors: { email: ['Invalid'] },
    };
    const res = handleBackendError<unknown>(response, payload, false);
    expect(res.status).toBe('error');
    expect(res.message).toBe('Validation failed');
    expect(res.errors).toEqual({ email: ['Invalid'] });
  });

  it('throws ApiClientError when throwOnError is true', () => {
    const response = new Response(null, {
      status: 422,
      statusText: 'Unprocessable',
      headers: new Headers({ 'x-request-id': 'req-456' }),
    });
    const payload = {
      status: 'error' as const,
      message: 'Validation failed',
      errors: { email: ['Invalid'] },
    };
    expect(() => handleBackendError<unknown>(response, payload, true)).toThrow(
      ApiClientError,
    );
    try {
      handleBackendError<unknown>(response, payload, true);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiClientError);
      expect((err as ApiClientError).status).toBe(422);
      expect((err as ApiClientError).requestId).toBe('req-456');
      expect((err as ApiClientError).payload).toEqual(payload);
    }
  });

  it('uses response statusText when payload message is undefined', () => {
    const response = new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
    const payload = {
      status: 'error' as const,
      message: undefined as unknown as string,
    };
    const res = handleBackendError<unknown>(response, payload, false);
    expect(res.message).toBe('Internal Server Error');
  });

  it('throws with MESSAGES.DEFAULT_ERROR when payload message is empty and throwOnError is true', () => {
    const response = new Response(null, { status: 500 });
    const payload = { status: 'error' as const, message: '' };
    expect(() => handleBackendError<unknown>(response, payload, true)).toThrow(
      ApiClientError,
    );
    try {
      handleBackendError<unknown>(response, payload, true);
    } catch (err) {
      expect((err as ApiClientError).message).toBe(MESSAGES.DEFAULT_ERROR);
    }
  });
});
