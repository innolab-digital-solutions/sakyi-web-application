import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import UserListTable from '@/components/admin/modules/users/UserListTable';
import UserSheet from '@/components/admin/modules/users/UserSheet';

export const metadata: Metadata = {
  title: 'User Accounts | SaKyi Admin',
  description:
    'Manage system user accounts: view, search, filter by status and role, and add or edit staff, coaches, and clients.',
};

export default function UserListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='User Accounts'
        description='Review all system accounts here. Search by name or email, filter by status or role, then open a user to update their details or remove them from the system.'
        actions={<UserSheet mode='create' />}
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading users…
          </div>
        }
      >
        <UserListTable />
      </Suspense>
    </div>
  );
}
