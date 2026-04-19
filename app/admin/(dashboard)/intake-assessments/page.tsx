import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import IntakeListTable from '@/components/admin/modules/intake-assessments/IntakeListTable';

export const metadata: Metadata = {
  title: 'Intake Assessments | SaKyi Admin',
  description:
    'Review all client intake assessments in one place: search and filter by status, view and manage assignments, continue active interviews, and track completion progress through final outcome.',
};

export default function IntakeAssessmentsPage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Intake Assessments'
        description='Review all client intake assessments in one place: search and filter by status, view and manage assignments, continue active interviews, and track completion progress through final outcome.'
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
