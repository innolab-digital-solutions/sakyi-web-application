import { ArrowLeftIcon } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

import PageHeader from '@/components/admin/layout/PageHeader';
import IntakeAssessmentWizard from '@/components/admin/modules/intake-assessments/IntakeAssessmentWizard';
import IntakeDetailPanel from '@/components/admin/modules/intake-assessments/IntakeDetailPanel';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

type IntakeAssessmentDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
  searchParams,
}: IntakeAssessmentDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const query = await searchParams;
  const intakeId = Number.parseInt(id, 10);

  if (Number.isNaN(intakeId)) {
    return {
      title: 'Invalid Intake Assessment',
      description: 'Invalid intake assessment id provided.',
    };
  }

  const view = Array.isArray(query.view) ? query.view[0] : query.view;
  const isInterview = view === 'interview';

  return {
    title: isInterview
      ? 'Intake Interview Session'
      : 'Intake Assessment Overview',
    description: isInterview
      ? 'Run and record the intake interview step by step, capturing accurate client responses with built-in validation to keep the assessment complete and reliable.'
      : 'Review this intake assessment in full, including client details, interview responses, processing status, and recommended next actions for follow-up.',
  };
}

export default async function IntakeAssessmentDetailPage({
  params,
  searchParams,
}: IntakeAssessmentDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const intakeId = Number.parseInt(id, 10);

  if (Number.isNaN(intakeId)) {
    throw new Error('Invalid intake assessment id.');
  }

  const view = Array.isArray(query.view) ? query.view[0] : query.view;
  const isInterview = view === 'interview';

  return (
    <div className='space-y-8'>
      <PageHeader
        title={
          isInterview
            ? 'Intake Interview Session'
            : 'Intake Assessment Overview'
        }
        description={
          isInterview
            ? 'Run and record the intake interview step by step, capturing accurate client responses with built-in validation to keep the assessment complete and reliable.'
            : 'Review this intake assessment in full, including client details, interview responses, processing status, and recommended next actions for follow-up.'
        }
        actions={
          <Button
            asChild
            variant='outline'
            className='bg-background hover:bg-muted h-10 shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            <Link href={ROUTES.ADMIN.MODULES.INTAKE_ASSESSMENTS.LIST}>
              <ArrowLeftIcon className='size-3.5' />
              Back to intake assessments
            </Link>
          </Button>
        }
      />
      {isInterview ? (
        <IntakeAssessmentWizard intakeId={intakeId} />
      ) : (
        <IntakeDetailPanel intakeId={intakeId} />
      )}
    </div>
  );
}
