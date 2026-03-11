import type { Metadata } from 'next';

import { slugify } from '@/lib/utils/string';

type ProgramDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  props: ProgramDetailPageProps,
): Promise<Metadata> {
  const { slug } = await props.params;

  const name = slugify(slug);

  return {
    title: `${name} Program | SaKyi Health & Wellness`,
    description: `Learn more about the ${name} program from SaKyi Health & Wellness, including structure, benefits, and how it supports your long-term health.`,
  };
}

export default async function ProgramDetailPage({
  params,
}: ProgramDetailPageProps) {
  const { slug } = await params;
  return <div>Here is the program detail page: {slug}</div>;
}
