import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import OperationalLogListTable from '@/components/admin/modules/operational-logs/OperationalLogListTable';

export const metadata: Metadata = {
  title: 'Operational Logs | SaKyi Admin',
  description:
    'Browse internal operational logs across care plans—draft, in progress, and locked. Search, filter by status, and open any log to continue evidence and metrics work in the workspace.',
};

export default function OperationalLogsPage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Operational logs'
        description='Browse internal operational logs across care plans. Use search and status filters to find draft, in-progress, or locked work, then open a row to review evidence, edit metrics, and continue the reporting workflow in the workspace.'
      />
      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading operational logs…
          </div>
        }
      >
        <OperationalLogListTable />
      </Suspense>
    </div>
  );
}
