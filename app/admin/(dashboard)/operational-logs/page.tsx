import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import OperationalLogListTable from '@/components/admin/modules/operational-logs/OperationalLogListTable';

export const metadata: Metadata = {
  title: 'Operational Logs | SaKyi Admin',
  description:
    'Work through draft and in-progress report runs: review client logs, adjust metrics, and move runs toward release. Published items stay hidden by default unless you include them.',
};

export default function OperationalLogsPage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Operational logs'
        description='Resume draft and in-progress report runs for active care plans. Filter by status, show published runs when you need to reference them, and open the workspace for a specific report run.'
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
