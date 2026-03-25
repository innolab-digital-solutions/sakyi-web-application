import PageHeader from '@/components/admin/layout/PageHeader';
import IntakeCreateForm from '@/components/admin/modules/onboarding/IntakeCreateForm';

export default function OnboardingIntakeCreatePage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Start intake'
        description='Step 1: choose who this phone session is for and optional desk notes. Step 2 opens the section-by-section questionnaire—same flow you use while on a call.'
      />
      <IntakeCreateForm />
    </div>
  );
}
