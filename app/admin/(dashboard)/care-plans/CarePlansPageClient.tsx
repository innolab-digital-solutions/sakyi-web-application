'use client';

import { PlusIcon } from 'lucide-react';
import { Suspense, useState } from 'react';

import { AdminTablePageSkeleton } from '@/components/admin/layout/AdminLoadingSkeletons';
import PageHeader from '@/components/admin/layout/PageHeader';
import CarePlanCreateModal from '@/components/admin/modules/care-plans/CarePlanCreateModal';
import CarePlanListTable from '@/components/admin/modules/care-plans/CarePlanListTable';
import { Button } from '@/components/ui/button';

export default function CarePlansPageClient() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Care Plans'
        description='Browse and manage all client care plans from one workspace, with quick access to assigned clients, reference codes, care windows, and current status for better follow-up.'
        actions={
          <Button
            type='button'
            className='h-10 gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
            onClick={() => setCreateOpen(true)}
          >
            <PlusIcon className='size-3.5' />
            Create care plan
          </Button>
        }
      />

      <CarePlanCreateModal open={createOpen} onOpenChange={setCreateOpen} />

      <Suspense fallback={<AdminTablePageSkeleton />}>
        <CarePlanListTable />
      </Suspense>
    </div>
  );
}
