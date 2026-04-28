import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import ClientProfileListTable from '@/components/admin/modules/client-profiles/ClientProfileListTable';

export const metadata: Metadata = {
  title: 'Client Profiles | SaKyi Admin',
  description:
    'Review client profiles with contact details, demographics, and client reference codes, and upload supporting files and documents to each record so support and care teams can coordinate with accurate, shared context.',
};

export default function ClientProfilesPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Client Profiles'
        description='Review client profiles with contact details, demographics, and client reference codes, and upload supporting files and documents to each record so support and care teams can coordinate with accurate, shared context.'
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading client profiles…
          </div>
        }
      >
        <ClientProfileListTable />
      </Suspense>
    </div>
  );
}
