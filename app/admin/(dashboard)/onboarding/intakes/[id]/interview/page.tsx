import PageHeader from '@/components/admin/layout/PageHeader';
import OnboardingWizard from '@/components/admin/modules/onboarding/OnboardingWizard';

type OnboardingInterviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OnboardingInterviewPage({
  params,
}: OnboardingInterviewPageProps) {
  const { id } = await params;
  const intakeId = Number.parseInt(id, 10);

  if (Number.isNaN(intakeId)) {
    throw new Error('Invalid intake id.');
  }

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Phone intake'
        description='Complete the questionnaire with your client; each tab is saved as you go.'
      />
      <OnboardingWizard intakeId={intakeId} />
    </div>
  );
}
