import PageHeader from '@/components/admin/layout/PageHeader';
import IntakeDetailPanel from '@/components/admin/modules/onboarding/IntakeDetailPanel';

type OnboardingIntakeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OnboardingIntakeDetailPage({
  params,
}: OnboardingIntakeDetailPageProps) {
  const { id } = await params;
  const intakeId = Number.parseInt(id, 10);

  if (Number.isNaN(intakeId)) {
    throw new Error('Invalid intake id.');
  }

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Intake Detail'
        description='Read-only overview and status summary for an onboarding intake.'
      />
      <IntakeDetailPanel intakeId={intakeId} />
    </div>
  );
}
