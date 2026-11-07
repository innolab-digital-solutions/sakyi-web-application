import { base } from '@/config/api/base';
import { MARKETING_ENDPOINTS } from '@/config/api/endpoints';
import { DEFAULT_LANGUAGE } from '@/config/languages';
import type { BlogPost } from '@/domains/blogs/types';
import type { Program } from '@/domains/programs/types';

const REVALIDATE_SECONDS = 3600;

/** Without `limit` the blog list returns a single page of 6 posts. */
const LIST_LIMIT = 1000;

/**
 * Server-side reads of the public marketing API, for metadata, sitemaps, and
 * structured data. The `http` client cannot opt into Next's fetch cache, and the
 * viewer's language lives in localStorage, so these always use the default
 * language. Resolves to `null` on any failure so SEO output never breaks a page.
 */
async function fetchMarketingData<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${base.versionEndpoint}${path}`, {
      // The API responds 406 to anything that does not explicitly accept JSON.
      headers: { Accept: 'application/json' },
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) return null;

    const json = (await response.json()) as { data?: T };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export const getServerBlogPost = (slug: string): Promise<BlogPost | null> =>
  fetchMarketingData<BlogPost>(
    `${MARKETING_ENDPOINTS.BLOGS.DETAIL(encodeURIComponent(slug))}?locale=${DEFAULT_LANGUAGE}`,
  );

export const getServerProgram = (slug: string): Promise<Program | null> =>
  fetchMarketingData<Program>(
    `${MARKETING_ENDPOINTS.PROGRAMS.DETAIL(encodeURIComponent(slug))}?locale=${DEFAULT_LANGUAGE}`,
  );

export const getServerBlogPosts = async (): Promise<BlogPost[]> =>
  (await fetchMarketingData<BlogPost[]>(
    `${MARKETING_ENDPOINTS.BLOGS.LIST}?locale=${DEFAULT_LANGUAGE}&limit=${LIST_LIMIT}`,
  )) ?? [];

export const getServerPrograms = async (): Promise<Program[]> =>
  (await fetchMarketingData<Program[]>(
    `${MARKETING_ENDPOINTS.PROGRAMS.LIST}?locale=${DEFAULT_LANGUAGE}&limit=${LIST_LIMIT}`,
  )) ?? [];
