import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import ClientProfileListTable from '@/components/admin/modules/client-profiles/ClientProfileListTable';

export const metadata: Metadata = {
  title: 'Client Profiles | SaKyi Admin',
  description:
    'Browse, search, and manage all client profiles. View details, contact information, and perform actions for each client profile in your workspace.',
};

export default function ClientProfilesPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Client Profiles'
        description='Browse, search, and manage all client profiles. View details, contact information, and perform actions for each client profile in your workspace.'
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
