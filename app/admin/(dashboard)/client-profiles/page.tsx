import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import ClientProfileListTable from '@/components/admin/modules/client-profiles/ClientProfileListTable';

export const metadata: Metadata = {
  title: 'Client Profiles | SaKyi Admin',
  description:
    'Browse and manage client profiles with quick access to account details, contact information, and follow-up actions so client support stays organized.',
};

export default function ClientProfilesPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Client Profiles'
        description='Browse and manage client profiles with quick access to account details, contact information, and follow-up actions so client support stays organized.'
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
