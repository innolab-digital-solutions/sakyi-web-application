import type { Metadata } from 'next';

type ProgramDetailPageProps = {
  params: Promise<{ slug: string }>;
};

const formatSlugForTitle = (slug: string): string => {
  return slug
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

export async function generateMetadata(
  props: ProgramDetailPageProps,
): Promise<Metadata> {
  const { slug } = await props.params;
  const programName = formatSlugForTitle(slug);

  return {
    title: `${programName} Program | SaKyi Health & Wellness`,
    description: `Learn more about the ${programName} program from SaKyi Health & Wellness, including structure, benefits, and how it supports your long-term health.`,
  };
}

export default async function ProgramDetailPage({
  params,
}: ProgramDetailPageProps) {
  const { slug } = await params;
  return <div>Here is the program detail page: {slug}</div>;
}
