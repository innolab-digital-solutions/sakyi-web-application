import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AdminTablePageSkeleton } from '@/components/admin/layout/AdminLoadingSkeletons';
import PageHeader from '@/components/admin/layout/PageHeader';
import EnrollmentRequestListTable from '@/components/admin/modules/enrollment-requests/EnrollmentRequestListTable';

export const metadata: Metadata = {
  title: 'Enrollment Requests | SaKyi Admin',
  description:
    'Triage incoming enrollment requests with status-based filtering, full request context, first-contact tracking, and clear handoff into intake when the client is ready.',
};

export default function EnrollmentRequestsPage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Enrollment Requests'
        description='Triage incoming enrollment requests with status-based filtering, full request context, first-contact tracking, and clear handoff into intake when the client is ready.'
      />

      <Suspense fallback={<AdminTablePageSkeleton />}>
        <EnrollmentRequestListTable />
      </Suspense>
    </div>
  );
}
