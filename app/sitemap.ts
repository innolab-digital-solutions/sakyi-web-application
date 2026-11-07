import type { MetadataRoute } from 'next';

import { ROUTES } from '@/config/routes';
import {
  getServerBlogPosts,
  getServerPrograms,
} from '@/lib/api/server/marketing';
import { resolveMarketingSiteUrl } from '@/lib/utils/url';

export const revalidate = 3600;

const STATIC_PATHS = [
  ROUTES.MARKETING.HOME,
  ROUTES.MARKETING.ABOUT,
  ROUTES.MARKETING.PROGRAMS,
  ROUTES.MARKETING.BLOG,
  ROUTES.MARKETING.CONTACT,
  ROUTES.MARKETING.PRIVACY_POLICY,
  ROUTES.MARKETING.TERMS_OF_SERVICE,
];

const toEntry = (
  path: string,
  publishedAt?: string | null,
): MetadataRoute.Sitemap[number] => ({
  url: resolveMarketingSiteUrl(path),
  ...(publishedAt ? { lastModified: publishedAt } : {}),
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [programs, posts] = await Promise.all([
    getServerPrograms(),
    getServerBlogPosts(),
  ]);

  return [
    ...STATIC_PATHS.map((path) => toEntry(path)),
    ...programs.map((program) =>
      toEntry(ROUTES.MARKETING.PROGRAM(program.slug), program.published_at),
    ),
    ...posts.map((post) =>
      toEntry(ROUTES.MARKETING.BLOG_POST(post.slug), post.published_at),
    ),
  ];
}
