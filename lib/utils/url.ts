import { base } from '@/config/api/base';

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
