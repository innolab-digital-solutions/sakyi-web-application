import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import EnrollmentRecordListTable from '@/components/admin/modules/enrollment-records/EnrollmentRecordListTable';

export const metadata: Metadata = {
  title: 'Enrollment Records | SaKyi Admin',
  description:
    'Browse, search, and manage all program enrollment records. Track each client’s enrollment status and key dates. Quickly find specific enrollments and monitor client progress from intake through completion with flexible filters and customizable columns.',
};

export default function EnrollmentRecordsPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Enrollment Records'
        description='Browse, search, and manage all program enrollment records. Track each client’s enrollment status and key dates. Quickly find specific enrollments and monitor client progress from intake through completion with flexible filters and customizable columns.'
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
