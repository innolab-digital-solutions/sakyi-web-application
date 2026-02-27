'use client';

import Image from 'next/image';

import TableLayout from '@/components/admin/layouts/TableLayout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

const ProgramTable = () => {
  const { rows, pagination } = useTable<Program>(ENDPOINTS.ADMIN.PROGRAMS.LIST);

  return (
    <TableLayout filters={null} pagination={pagination}>
      <Table>
        <TableHeader>
          <TableRow className='hidden md:table-row'>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Enrollments</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((program) => (
            <TableRow key={program.id}>
              <TableCell>
                <Image
                  src={program.picture}
                  alt={program.name}
                  width={32}
                  height={32}
                  className='bg-muted shrink-0 rounded-md'
                  style={{ objectFit: 'cover' }}
                />
                <span>{program.name}</span>
              </TableCell>
              <TableCell>{program.address}</TableCell>
              <TableCell>{program.phone}</TableCell>
              <TableCell>{program.dob}</TableCell>
              <TableCell>{program.gender}</TableCell>
              <TableCell>
                <span
                  className={
                    program.status === 'active'
                      ? 'rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-800'
                      : 'rounded bg-gray-100 px-2 py-1 text-xs font-bold text-gray-500'
                  }
                >
                  {program.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </TableCell>
              <TableCell>
                <Button size='sm' variant='outline'>
                  View
                </Button>
                <Button size='sm' variant='outline' className='ml-2'>
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableLayout>
  );
};

export default ProgramTable;
