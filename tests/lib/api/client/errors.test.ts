import { describe, expect, it } from 'vitest';

import { ApiClientError } from '@/lib/api/client/errors';

describe('ApiClientError', () => {
  it('sets name to ApiClientError', () => {
    const err = new ApiClientError('Message', 500);
    expect(err.name).toBe('ApiClientError');
  });

  it('preserves message and status', () => {
    const err = new ApiClientError('Something failed', 422);
    expect(err.message).toBe('Something failed');
    expect(err.status).toBe(422);
  });

  it('stores optional errors record', () => {
    const errors = { email: ['Invalid format'] };
    const err = new ApiClientError('Validation failed', 422, errors);
    expect(err.errors).toEqual(errors);
  });

  it('stores optional requestId and payload', () => {
    const payload = { status: 'error', message: 'Backend error' };
    const err = new ApiClientError('Error', 500, undefined, 'req-123', payload);
    expect(err.requestId).toBe('req-123');
    expect(err.payload).toEqual(payload);
  });

  it('is an instance of Error', () => {
    const err = new ApiClientError('Message', 400);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiClientError);
  });

  describe('isForbidden', () => {
    it('returns true when status is 403', () => {
      const err = new ApiClientError('Forbidden', 403);
      expect(err.isForbidden).toBe(true);
    });

    it('returns false for other statuses', () => {
      expect(new ApiClientError('', 401).isForbidden).toBe(false);
      expect(new ApiClientError('', 404).isForbidden).toBe(false);
    });
  });

  describe('isNotFound', () => {
    it('returns true when status is 404', () => {
      const err = new ApiClientError('Not found', 404);
      expect(err.isNotFound).toBe(true);
    });

    it('returns false for other statuses', () => {
      expect(new ApiClientError('', 400).isNotFound).toBe(false);
    });
  });

  describe('isServerError', () => {
    it('returns true when status is 500 or greater', () => {
      expect(new ApiClientError('', 500).isServerError).toBe(true);
      expect(new ApiClientError('', 502).isServerError).toBe(true);
    });

    it('returns false when status is below 500', () => {
      expect(new ApiClientError('', 499).isServerError).toBe(false);
      expect(new ApiClientError('', 404).isServerError).toBe(false);
    });
  });

  describe('isValidationError', () => {
    it('returns true when status is 422', () => {
      const err = new ApiClientError('Validation failed', 422);
      expect(err.isValidationError).toBe(true);
    });

    it('returns false for other statuses', () => {
      expect(new ApiClientError('', 400).isValidationError).toBe(false);
    });
  });

  describe('isUnauthorized', () => {
    it('returns true when status is 401 or 419', () => {
      expect(new ApiClientError('', 401).isUnauthorized).toBe(true);
      expect(new ApiClientError('', 419).isUnauthorized).toBe(true);
    });

    it('returns false for other statuses', () => {
      expect(new ApiClientError('', 403).isUnauthorized).toBe(false);
      expect(new ApiClientError('', 200).isUnauthorized).toBe(false);
    });
  });
});
