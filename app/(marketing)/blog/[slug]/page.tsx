import type { Metadata } from 'next';

import BlogDetailSection from '@/components/marketing/sections/blog/BlogDetailSection';
import { base } from '@/config/api/base';
import { MARKETING_ENDPOINTS } from '@/config/api/endpoints';
import { DEFAULT_LANGUAGE } from '@/config/languages';
import type { BlogPost } from '@/domains/blogs/types';
import { resolveApiImageUrl } from '@/lib/utils/url';

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

async function fetchPostForMetadata(slug: string): Promise<BlogPost | null> {
  try {
    // Server-side metadata fetch: the `http` client cannot opt into Next's
    // fetch cache, and the viewer's language preference lives in localStorage,
    // so this renders tags in the default language.
    const endpoint = `${base.versionEndpoint}${MARKETING_ENDPOINTS.BLOGS.DETAIL(
      encodeURIComponent(slug),
    )}?locale=${DEFAULT_LANGUAGE}`;
    const res = await fetch(endpoint, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    // API wraps in { status, data } — handle both shapes
    return (json?.data ?? json) as BlogPost;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  props: BlogDetailPageProps,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await fetchPostForMetadata(slug);

  if (!post) {
    return {
      title: 'Blog | SaKyi Health & Wellness',
      description:
        'Read expert wellness insights from the SaKyi Health & Wellness blog.',
    };
  }

  const title = `${post.title} | SaKyi Health & Wellness`;
  const description =
    post.excerpt ??
    'Read expert wellness insights from the SaKyi Health & Wellness blog.';
  const thumbnail = resolveApiImageUrl(post.thumbnail_url);
  const images = thumbnail ? [{ url: thumbnail, alt: post.title }] : [];

  return {
    title,
    description,
    openGraph: {
      type: 'article',
      title,
      description,
      images,
      publishedTime: post.timestamps?.published_at ?? undefined,
    },
    twitter: {
      card: thumbnail ? 'summary_large_image' : 'summary',
      title,
      description,
      images: thumbnail ? [thumbnail] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  return <BlogDetailSection slug={slug} />;
}
