import { beforeEach, describe, expect, it, vi } from 'vitest';

import sitemap from '@/app/sitemap';
import { SITE_URL } from '@/config/site';
import {
  getServerBlogPosts,
  getServerPrograms,
} from '@/lib/api/server/marketing';

vi.mock('@/lib/api/server/marketing', () => ({
  getServerBlogPosts: vi.fn(),
  getServerPrograms: vi.fn(),
}));

const STATIC_PAGE_COUNT = 7;

describe('sitemap', () => {
  beforeEach(() => {
    vi.mocked(getServerBlogPosts).mockResolvedValue([]);
    vi.mocked(getServerPrograms).mockResolvedValue([]);
  });

  it('keeps the static pages when the API returns nothing', async () => {
    const entries = await sitemap();

    expect(entries).toHaveLength(STATIC_PAGE_COUNT);
    expect(entries[0]?.url).toBe(`${SITE_URL}/`);
  });

  it('adds programs and posts with their publish dates', async () => {
    vi.mocked(getServerPrograms).mockResolvedValue([
      { slug: 'program-1', published_at: '2026-07-18T09:39:30.000000Z' },
    ] as never);
    vi.mocked(getServerBlogPosts).mockResolvedValue([
      { slug: 'post-1', published_at: null },
    ] as never);

    const entries = await sitemap();

    expect(entries).toHaveLength(STATIC_PAGE_COUNT + 2);
    expect(entries).toContainEqual({
      url: `${SITE_URL}/programs/program-1`,
      lastModified: '2026-07-18T09:39:30.000000Z',
    });
    expect(entries).toContainEqual({ url: `${SITE_URL}/blog/post-1` });
  });
});
