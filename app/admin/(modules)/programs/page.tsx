'use client';

import DataTable from '@/components/admin/control/table/DataTable';
import TableContainer from '@/components/admin/control/table/TableContainer';
import ENDPOINTS from '@/config/endpoints';
import { useTable } from '@/hooks/table';

type Program = {
  id: number;
  name: string;
  email: string;
  picture: string;
  dob: string;
  gender: string;
  phone: string;
  address: string;
  status: string;
  timestamps: {
    email_verified_at: string;
    last_login_at: string;
    created_at: string;
    updated_at: string;
  };
};

export default function ProgramsListPage() {
  const { rows } = useTable<Program>(ENDPOINTS.ADMIN.PROGRAMS.LIST);
  console.log(rows);
  return (
    <div className='space-y-8'>
      {/* <div className='flex items-center justify-between'>
        <div className='flex flex-col space-y-1.5'>
          <h1 className='text-foreground text-lg font-bold'>Programs List</h1>
          <p className='text-muted-foreground text-sm font-medium'>
            View, manage, and organize all client records from a centralized
            dashboard. Access detailed client profiles and maintain up-to-date
            information efficiently.
          </p>
        </div>
        <div>
          <Button variant='default' className='cursor-pointer gap-2'>
            <CirclePlus className='size-4' />
            Add Program
          </Button>
        </div>
      </div> */}

      <TableContainer>
        <DataTable />
      </TableContainer>
    </div>
  );
}
