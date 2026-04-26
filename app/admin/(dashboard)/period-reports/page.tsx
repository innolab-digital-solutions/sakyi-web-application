import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import PeriodReportListTable from '@/components/admin/modules/period-reports/PeriodReportListTable';

export const metadata: Metadata = {
  title: 'Period Reports | SaKyi Admin',
  description:
    'Review client-facing period reports across care plans. Filter, compare dates, and open in-review, published, or archived reports to edit narrative or read finalized output.',
};

export default function PeriodReportsPage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Period reports'
        description='Review client-facing period reports across care plans. Filter and search, compare submitted and published dates, then open a report to work in-review narrative, read finalized output, or consult archived items.'
      />
      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading period reports…
          </div>
        }
      >
        <PeriodReportListTable />
      </Suspense>
    </div>
  );
}
