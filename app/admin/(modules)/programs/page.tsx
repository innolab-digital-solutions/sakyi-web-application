import { CirclePlus } from 'lucide-react';
import Link from 'next/link';

import ProgramTable from '@/components/admin/modules/programs/ProgramTable';
import { Button } from '@/components/ui/button';
import PATHS from '@/config/paths';

export default function ProgramListsPage() {
  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div className='flex flex-col space-y-1.5'>
          <h1 className='text-foreground text-md font-bold'>Program Lists</h1>
          <p className='text-muted-foreground text-sm font-medium'>
            Manage and organize programs in one place.
          </p>
        </div>
        <div>
          <Button
            asChild
            variant='default'
            className='cursor-pointer gap-2'
          >
            <Link href={`${PATHS.ADMIN.PROGRAMS}/create`}>
              <CirclePlus className='size-4' />
              Add Program
            </Link>
          </Button>
        </div>
      </div>

      <ProgramTable />
    </div>
  );
}
