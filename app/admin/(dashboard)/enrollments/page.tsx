import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import EnrollmentRecordListTable from '@/components/admin/modules/enrollment-records/EnrollmentRecordListTable';

export const metadata: Metadata = {
  title: 'Enrollment Records | SaKyi Admin',
  description:
    'Browse program enrollments: client and program context, status, key dates, and links to related intake and contract records.',
};

export default function EnrollmentRecordsPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Enrollment Records'
        description='Track every program enrollment after intake and contract: who is enrolled, in which program, current status, and start and end dates. Search by reference, client, or program details.'
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading enrollment records…
          </div>
        }
      >
        <EnrollmentRecordListTable />
      </Suspense>
    </div>
  );
}
