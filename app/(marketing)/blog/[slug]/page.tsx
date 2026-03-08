import type { Metadata } from 'next';

import { formatSlugAsTitle } from '@/lib/utils/formatting';

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  props: BlogDetailPageProps,
): Promise<Metadata> {
  const { slug } = await props.params;
  const articleTitle = formatSlugAsTitle(slug);

  return {
    title: `${articleTitle} | SaKyi Health & Wellness Blog`,
    description: `Read “${articleTitle}” from the SaKyi Health & Wellness blog, sharing insights on wellbeing, movement, nutrition, and sustainable lifestyle change.`,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  return <div>Here is the blog detail page: {slug}</div>;
}
