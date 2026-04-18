import { PlusIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import TeamListTable from '@/components/admin/modules/teams/TeamListTable';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Teams | SaKyi Admin',
  description: 'Browse and manage teams and their assigned staff members.',
};

export default function TeamListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Teams'
        description='Manage teams and assign staff members to client enrollments.'
        actions={
          <Button asChild size='lg'>
            <Link href={ROUTES.ADMIN.MODULES.TEAMS.CREATE}>
              <PlusIcon className='size-4' />
              Create team
            </Link>
          </Button>
        }
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading teams…
          </div>
        }
      >
        <TeamListTable />
      </Suspense>
    </div>
  );
}
