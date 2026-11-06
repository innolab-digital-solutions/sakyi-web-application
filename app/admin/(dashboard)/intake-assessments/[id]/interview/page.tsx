import PageHeader from '@/components/admin/layout/PageHeader';
import IntakeAssessmentWizard from '@/components/admin/modules/intake-assessments/IntakeAssessmentWizard';

type IntakeAssessmentInterviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function IntakeAssessmentInterviewPage({
  params,
}: IntakeAssessmentInterviewPageProps) {
  const { id } = await params;
  const intakeId = Number.parseInt(id, 10);

  if (Number.isNaN(intakeId)) {
    throw new Error('Invalid intake assessment id.');
  }

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Intake Assessment Interview'
        description='Guide the client through each intake interview step while progress saves automatically, so you can complete the assessment without losing context.'
      />
      <IntakeAssessmentWizard intakeId={intakeId} />
    </div>
  );
}
