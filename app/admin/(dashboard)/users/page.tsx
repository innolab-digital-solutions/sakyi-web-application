import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AdminTablePageSkeleton } from '@/components/admin/layout/AdminLoadingSkeletons';
import PageHeader from '@/components/admin/layout/PageHeader';
import UserListTable from '@/components/admin/modules/users/UserListTable';
import UserSheet from '@/components/admin/modules/users/UserSheet';

export const metadata: Metadata = {
  title: 'User Accounts | SaKyi Admin',
  description:
    'Manage user accounts, role assignments, and access status so permissions stay accurate across daily operations.',
};

export default function UserListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='User Accounts'
        description='Manage user accounts, role assignments, and access status so permissions remain accurate and secure across daily operations.'
        actions={<UserSheet mode='create' />}
      />

      <Suspense fallback={<AdminTablePageSkeleton />}>
        <UserListTable />
      </Suspense>
    </div>
  );
}
