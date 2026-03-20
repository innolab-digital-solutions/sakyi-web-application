import type { Metadata } from 'next';

import BlogDetailSection from '@/components/marketing/sections/blog/BlogDetailSection';
import { slugify } from '@/lib/utils/string';

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  props: BlogDetailPageProps,
): Promise<Metadata> {
  const { slug } = await props.params;
  const title = slugify(slug);

  return {
    title: `${title} | SaKyi Health & Wellness Blog`,
    description: `Read "${title}" from the SaKyi Health & Wellness blog, sharing insights on wellbeing, movement, nutrition, and sustainable lifestyle change.`,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  return <BlogDetailSection slug={slug} />;
}
