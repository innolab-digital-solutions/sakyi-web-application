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
        description='Work through the intake assessment form with the client. Progress saves as you move through steps.'
      />
      <IntakeAssessmentWizard intakeId={intakeId} />
    </div>
  );
}
