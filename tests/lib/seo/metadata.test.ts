import { describe, expect, it } from 'vitest';

import { DEFAULT_OG_IMAGE, SITE_NAME } from '@/config/site';
import { buildPageMetadata } from '@/lib/seo/metadata';

const options = { description: 'About the page.', path: '/about' };

describe('buildPageMetadata', () => {
  it('leaves a plain title for the template and suffixes the share title', () => {
    const metadata = buildPageMetadata({ ...options, title: 'About' });

    expect(metadata.title).toBe('About');
    expect(metadata.openGraph?.title).toBe(`About | ${SITE_NAME}`);
    expect(metadata.twitter?.title).toBe(`About | ${SITE_NAME}`);
  });

  it('uses an absolute title as written', () => {
    const title = { absolute: 'About SaKyi' };
    const metadata = buildPageMetadata({ ...options, title });

    expect(metadata.title).toEqual(title);
    expect(metadata.openGraph?.title).toBe('About SaKyi');
  });

  it('sets the canonical and share URL from the path', () => {
    const metadata = buildPageMetadata({ ...options, title: 'About' });

    expect(metadata.alternates?.canonical).toBe('/about');
    expect(metadata.openGraph?.url).toBe('/about');
  });

  it('falls back to the default share image', () => {
    const metadata = buildPageMetadata({
      ...options,
      title: 'About',
      image: null,
    });

    expect(metadata.openGraph?.images).toEqual([DEFAULT_OG_IMAGE]);
  });

  it('adds the publish date to articles', () => {
    const metadata = buildPageMetadata({
      ...options,
      title: 'Post',
      type: 'article',
      image: { url: 'https://cdn.example.com/a.png', alt: 'Post' },
      publishedTime: '2026-06-29T03:54:32.000000Z',
    });

    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      publishedTime: '2026-06-29T03:54:32.000000Z',
    });
    expect(metadata.twitter?.images).toEqual(['https://cdn.example.com/a.png']);
  });
});
