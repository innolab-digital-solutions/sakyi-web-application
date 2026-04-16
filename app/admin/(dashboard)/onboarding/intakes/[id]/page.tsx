import PageHeader from '@/components/admin/layout/PageHeader';
import IntakeDetailPanel from '@/components/admin/modules/onboarding/IntakeDetailPanel';
import OnboardingWizard from '@/components/admin/modules/onboarding/OnboardingWizard';

type OnboardingIntakeDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OnboardingIntakeDetailPage({
  params,
  searchParams,
}: OnboardingIntakeDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const intakeId = Number.parseInt(id, 10);

  if (Number.isNaN(intakeId)) {
    throw new Error('Invalid intake id.');
  }

  const view = Array.isArray(query.view) ? query.view[0] : query.view;
  const isInterview = view === 'interview';

  return (
    <div className='space-y-8'>
      <PageHeader
        title={isInterview ? 'Phone intake' : 'Intake Detail'}
        description={
          isInterview
            ? 'Complete the questionnaire with your client; each tab is saved as you go.'
            : 'Read-only overview and status summary for an onboarding intake.'
        }
      />
      {isInterview ? (
        <OnboardingWizard intakeId={intakeId} />
      ) : (
        <IntakeDetailPanel intakeId={intakeId} />
      )}
    </div>
  );
}
