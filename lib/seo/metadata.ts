import type { Metadata } from 'next';

import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_TITLE_TEMPLATE,
} from '@/config/site';

/** For pages that must stay out of search results. */
export const NOINDEX_ROBOTS: Metadata['robots'] = {
  index: false,
  follow: false,
};

type PageMetadataOptions = {
  /** A plain string gets the site suffix; `{ absolute }` is used as written. */
  title: string | { absolute: string };
  description: string;
  /** Path of the page; resolved against `metadataBase`. */
  path: string;
  type?: 'website' | 'article';
  image?: { url: string; alt: string } | null;
  publishedTime?: string;
};

/**
 * Builds the canonical, Open Graph, and Twitter tags for a public page.
 *
 * Next.js replaces rather than merges these objects, so every page needs its
 * own; otherwise pages would inherit the root layout's share title.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  type = 'website',
  image,
  publishedTime,
}: PageMetadataOptions): Metadata {
  const fullTitle =
    typeof title === 'string'
      ? SITE_TITLE_TEMPLATE.replace('%s', () => title)
      : title.absolute;
  const shareImage = image ?? DEFAULT_OG_IMAGE;
  const openGraph = {
    title: fullTitle,
    description,
    url: path,
    siteName: SITE_NAME,
    images: [shareImage],
  };

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph:
      type === 'article'
        ? { ...openGraph, type, publishedTime }
        : { ...openGraph, type },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [shareImage.url],
    },
  };
}
