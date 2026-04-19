'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import EnrollmentFromContractForm from '@/components/admin/modules/enrollment-contracts/EnrollmentFromContractForm';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { getEnrollmentContractById } from '@/domains/enrollment-contracts/services';

export type CreateEnrollmentFromContractViewProps = {
  contractId: number;
};

export default function CreateEnrollmentFromContractView({
  contractId,
}: CreateEnrollmentFromContractViewProps) {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['enrollment-contract', contractId],
    queryFn: async () => {
      const res = await getEnrollmentContractById(contractId);
      if (res.status === 'error') {
        throw new Error(res.message || 'Could not load contract.');
      }
      return res.data;
    },
  });

  if (isPending) {
    return (
      <div className='text-muted-foreground rounded-md border border-dashed p-10 text-center text-sm'>
        Loading contract…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className='border-destructive/30 bg-destructive/5 text-destructive mx-auto max-w-3xl rounded-md border p-6 text-sm'>
        <p>{error instanceof Error ? error.message : 'Could not load contract.'}</p>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='mt-4'
          onClick={() => void refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (data.status !== 'signed') {
    return (
      <div className='border-border mx-auto max-w-3xl rounded-md border bg-amber-50/80 p-6 text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-100'>
        <p className='font-medium'>
          This contract is not signed yet. Create an enrollment only after the
          client has completed e-signature.
        </p>
        <Button variant='outline' size='sm' className='mt-4' asChild>
          <Link href={ROUTES.ADMIN.MODULES.ENROLLMENT_CONTRACTS.LIST}>
            Back to contracts
          </Link>
        </Button>
      </div>
    );
  }

  if (data.enrollment_id != null) {
    return (
      <div className='border-border mx-auto max-w-3xl rounded-md border bg-muted/40 p-6 text-sm'>
        <p className='text-foreground font-medium'>
          An enrollment already exists for this contract.
        </p>
        <div className='mt-4 flex flex-wrap gap-2'>
          <Button size='sm' asChild>
            <Link
              href={ROUTES.ADMIN.MODULES.ENROLLMENT_RECORDS.DETAIL(
                String(data.enrollment_id),
              )}
            >
              View enrollment
            </Link>
          </Button>
          <Button variant='outline' size='sm' asChild>
            <Link href={ROUTES.ADMIN.MODULES.ENROLLMENT_CONTRACTS.LIST}>
              Back to contracts
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return <EnrollmentFromContractForm contract={data} />;
}
