import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import ClientProfileListTable from '@/components/admin/modules/client-profiles/ClientProfileListTable';

export const metadata: Metadata = {
  title: 'Client Profiles | SaKyi Admin',
  description:
    'Browse enrolled clients: account codes, contact details, profile photos, enrollment counts, and quick access to each client record.',
};

export default function ClientProfilesPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Client Profiles'
        description='See everyone with a client account in your workspace. Search by name, email, or client code; open a profile to review contact details and active enrollments.'
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
