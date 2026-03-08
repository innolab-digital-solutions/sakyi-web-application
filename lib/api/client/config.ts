import { apiBase } from '@/config/api/base';

/**
 * Centralized API client configuration for all HTTP requests.
 *
 * Base URLs are resolved from {@link apiBase} (config/api/base.ts), which reads
 * NEXT_PUBLIC_API_DOMAIN_ENDPOINT and NEXT_PUBLIC_API_VERSION_ENDPOINT from the environment.
 *
 * @example
 *   fetch(`${api.versionEndpoint}/users`);
 *   fetch(`${api.domainEndpoint}/sanctum/csrf-cookie`);
 */
export const api = {
  get versionEndpoint(): string {
    return apiBase.version;
  },

  get domainEndpoint(): string {
    return apiBase.domain;
  },
} as const;
