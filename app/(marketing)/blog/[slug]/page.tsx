import type { Metadata } from 'next';

import BlogDetailSection from '@/components/marketing/sections/blog/BlogDetailSection';
import JsonLd from '@/components/shared/JsonLd';
import { ROUTES } from '@/config/routes';
import { getServerBlogPost } from '@/lib/api/server/marketing';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { blogPostingJsonLd } from '@/lib/seo/structured-data';
import { resolveApiImageUrl } from '@/lib/utils/url';

const FALLBACK_DESCRIPTION =
  'Read expert wellness insights from the SaKyi Health & Wellness blog.';

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  props: BlogDetailPageProps,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getServerBlogPost(slug);

  if (!post) {
    return { title: 'Blog', description: FALLBACK_DESCRIPTION };
  }

  const thumbnail = resolveApiImageUrl(post.thumbnail_url);

  return buildPageMetadata({
    title: post.title,
    description: post.excerpt ?? FALLBACK_DESCRIPTION,
    path: ROUTES.MARKETING.BLOG_POST(post.slug),
    type: 'article',
    image: thumbnail ? { url: thumbnail, alt: post.title } : null,
    publishedTime: post.published_at ?? undefined,
  });
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getServerBlogPost(slug);

  return (
    <>
      {post && <JsonLd data={blogPostingJsonLd(post)} />}
      <BlogDetailSection slug={slug} />
    </>
  );
}
