import { base } from '@/config/api/base';
import { SITE_URL } from '@/config/site';

/**
 * Absolute URL for a marketing-site path (opens correctly from admin in a new tab).
 */
export function resolveMarketingSiteUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

/**
 * Ensures an API-returned image path is always an absolute URL.
 * The admin API returns relative paths (/storage/...); the marketing API may
 * return either relative paths or full URLs depending on the environment.
 */
export function resolveApiImageUrl(
  path: string | null | undefined,
): string | null {
  if (!path || path.trim() === '') return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${base.domainEndpoint}${path.startsWith('/') ? '' : '/'}${path}`;
}
