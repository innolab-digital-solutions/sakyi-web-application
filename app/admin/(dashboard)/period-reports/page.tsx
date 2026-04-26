import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import PeriodReportListTable from '@/components/admin/modules/period-reports/PeriodReportListTable';

export const metadata: Metadata = {
  title: 'Period Reports | SaKyi Admin',
  description:
    'Review generated snapshots and published period outputs. Filter by status, see key dates, and open the same workspace to edit review-ready runs or view finalized reports.',
};

export default function PeriodReportsPage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Period reports'
        description='View generated and published period report runs. Filter by status, compare key dates, and open a run to review content or a finalized client-visible release.'
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
