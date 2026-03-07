import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { api } from '@/lib/api/client/config';

const envSnapshot: Record<string, string | undefined> = {};

describe('api config', () => {
  beforeEach(() => {
    envSnapshot.NEXT_PUBLIC_API_VERSION_ENDPOINT =
      process.env.NEXT_PUBLIC_API_VERSION_ENDPOINT;
    envSnapshot.NEXT_PUBLIC_API_DOMAIN_ENDPOINT =
      process.env.NEXT_PUBLIC_API_DOMAIN_ENDPOINT;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_VERSION_ENDPOINT =
      envSnapshot.NEXT_PUBLIC_API_VERSION_ENDPOINT;
    process.env.NEXT_PUBLIC_API_DOMAIN_ENDPOINT =
      envSnapshot.NEXT_PUBLIC_API_DOMAIN_ENDPOINT;
  });

  it('versionEndpoint strips trailing slashes', () => {
    process.env.NEXT_PUBLIC_API_VERSION_ENDPOINT =
      'https://api.example.com/v1///';
    expect(api.versionEndpoint).toBe('https://api.example.com/v1');
  });

  it('domainEndpoint strips trailing slashes', () => {
    process.env.NEXT_PUBLIC_API_DOMAIN_ENDPOINT = 'https://api.example.com/';
    expect(api.domainEndpoint).toBe('https://api.example.com');
  });
});
