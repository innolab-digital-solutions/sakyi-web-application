import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AdminTablePageSkeleton } from '@/components/admin/layout/AdminLoadingSkeletons';
import PageHeader from '@/components/admin/layout/PageHeader';
import IntakeListTable from '@/components/admin/modules/intake-assessments/IntakeListTable';

export const metadata: Metadata = {
  title: 'Intake Assessments | SaKyi Admin',
  description:
    'Review all intake assessments in one workspace, with tools to filter by status, manage assignments, continue interviews, and monitor completion progress.',
};

export default function IntakeAssessmentsPage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Intake Assessments'
        description='Review all intake assessments in one workspace, with tools to filter by status, manage assignments, continue interviews, and monitor completion progress.'
      />

      <Suspense fallback={<AdminTablePageSkeleton />}>
        <IntakeListTable />
      </Suspense>
    </div>
  );
}
