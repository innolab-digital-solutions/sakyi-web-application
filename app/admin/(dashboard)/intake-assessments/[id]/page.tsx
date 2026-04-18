import PageHeader from '@/components/admin/layout/PageHeader';
import IntakeAssessmentWizard from '@/components/admin/modules/intake-assessments/IntakeAssessmentWizard';
import IntakeDetailPanel from '@/components/admin/modules/intake-assessments/IntakeDetailPanel';

type IntakeAssessmentDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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
            ? 'Intake Assessment Interview'
            : 'Intake Assessment Details'
        }
        description={
          isInterview
            ? 'Complete the intake interview section by section, validate client responses, and save progress continuously before final review and completion.'
            : 'Review the full intake record, verify submitted responses, track handling progress, and identify the next action needed to move the case forward.'
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
