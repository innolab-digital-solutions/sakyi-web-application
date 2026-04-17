import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import IntakeListTable from '@/components/admin/modules/intake-assessments/IntakeListTable';

export const metadata: Metadata = {
  title: 'Intake Assessments | SaKyi Admin',
  description: 'Admin queue for intake assessments and progress tracking.',
};

export default function IntakeAssessmentsPage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Intake Assessments'
        description='Review all client intake assessments in one place, see assignment and completion progress, continue active interviews, and move each case through to final outcome.'
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground text-sm'>Loading...</div>
        }
      >
        <IntakeListTable />
      </Suspense>
    </div>
  );
}
