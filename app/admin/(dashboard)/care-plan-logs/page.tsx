import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AdminTablePageSkeleton } from '@/components/admin/layout/AdminLoadingSkeletons';
import PageHeader from '@/components/admin/layout/PageHeader';
import CarePlanLogListTable from '@/components/admin/modules/care-plan-logs/CarePlanLogListTable';

export const metadata: Metadata = {
  title: 'Daily Task Logs | SaKyi Admin',
  description:
    'Track daily task logging across active care plans with clear recency signals, timeline progress context, and direct access to detailed entry-level logs.',
};

export default function CarePlanLogsPage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Daily Task Logs'
        description='Track daily task logging across active care plans with recency indicators, timeline progress context, and clear visibility into completion patterns. Open each care plan to review detailed entries for operational follow-up.'
      />
      <Suspense fallback={<AdminTablePageSkeleton />}>
        <CarePlanLogListTable />
      </Suspense>
    </div>
  );
}
