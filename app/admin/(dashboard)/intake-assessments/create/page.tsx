import PageHeader from '@/components/admin/layout/PageHeader';
import IntakeCreateForm from '@/components/admin/modules/intake-assessments/IntakeCreateForm';

export default function IntakeAssessmentCreatePage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Start Intake Assessment'
        description='Select the enrollment request context and begin a guided intake assessment interview.'
      />
      <IntakeCreateForm />
    </div>
  );
}
