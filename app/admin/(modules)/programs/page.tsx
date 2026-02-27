import DataTable from '@/components/admin/control/table/DataTable';
import TableContainer from '@/components/admin/control/table/TableContainer';

export default function ProgramsListPage() {
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
