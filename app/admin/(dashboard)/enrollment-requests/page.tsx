import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import EnrollmentRequestListTable from '@/components/admin/modules/enrollment-requests/EnrollmentRequestListTable';

export const metadata: Metadata = {
  title: 'Enrollment Requests | SaKyi Admin',
  description:
    'Review and manage client program enrollment requests: triage new submissions, record contact, and move requests through your workflow.',
};

export default function EnrollmentRequestsPage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Enrollment Requests'
        description='Review incoming enrollment requests, confirm who is assigned to each case, track first-contact activity, and update request status as clients progress to intake.'
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground text-sm'>Loading...</div>
        }
      >
        <EnrollmentRequestListTable />
      </Suspense>
    </div>
  );
}
