import type { Metadata } from 'next';

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
    description: `Read “${title}” from the SaKyi Health & Wellness blog, sharing insights on wellbeing, movement, nutrition, and sustainable lifestyle change.`,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  return <div>Here is the blog detail page: {slug}</div>;
}
