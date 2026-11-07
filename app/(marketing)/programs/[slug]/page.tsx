import type { Metadata } from 'next';

import ProgramDetailSection from '@/components/marketing/sections/programs/ProgramDetailSection';
import { ROUTES } from '@/config/routes';
import { getServerProgram } from '@/lib/api/server/marketing';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { resolveApiImageUrl } from '@/lib/utils/url';

type ProgramDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  props: ProgramDetailPageProps,
): Promise<Metadata> {
  const { slug } = await props.params;
  const program = await getServerProgram(slug);

  if (!program) {
    return {
      title: 'Wellness Programs',
      description:
        'Explore personalized wellness programs from SaKyi Health & Wellness.',
    };
  }

  const thumbnail = resolveApiImageUrl(program.thumbnail_url);

  return buildPageMetadata({
    title: program.title,
    description: program.excerpt,
    path: ROUTES.MARKETING.PROGRAM(program.slug),
    image: thumbnail ? { url: thumbnail, alt: program.title } : null,
  });
}

export default async function ProgramDetailPage({
  params,
}: ProgramDetailPageProps) {
  const { slug } = await params;

  return <ProgramDetailSection slug={slug} />;
}
