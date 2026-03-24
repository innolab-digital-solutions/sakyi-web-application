import PageHeader from '@/components/admin/layout/PageHeader';
import IntakeCreateForm from '@/components/admin/modules/onboarding/IntakeCreateForm';

export default function OnboardingIntakeCreatePage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Start Intake'
        description='Create a new admin-guided onboarding intake for a client.'
      />
      <IntakeCreateForm />
    </div>
  );
}
