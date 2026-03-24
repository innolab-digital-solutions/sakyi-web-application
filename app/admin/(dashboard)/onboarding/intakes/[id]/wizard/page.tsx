import PageHeader from '@/components/admin/layout/PageHeader';
import OnboardingWizard from '@/components/admin/modules/onboarding/OnboardingWizard';

type OnboardingWizardPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OnboardingWizardPage({
  params,
}: OnboardingWizardPageProps) {
  const { id } = await params;
  const intakeId = Number.parseInt(id, 10);

  if (Number.isNaN(intakeId)) {
    throw new Error('Invalid intake id.');
  }

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Onboarding Wizard'
        description='Capture client details section-by-section and save progress.'
      />
      <OnboardingWizard intakeId={intakeId} />
    </div>
  );
}
