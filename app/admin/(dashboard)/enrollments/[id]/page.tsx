import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import PageHeader from '@/components/admin/layout/PageHeader';
import EnrollmentRecordDetailView from '@/components/admin/modules/enrollment-records/EnrollmentRecordDetailView';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Enrollment record overview | SaKyi Admin',
  description:
    'Review enrollment status, program window, completion and updates, optional care plan context, and open related intake and contract records.',
};

type EnrollmentRecordPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EnrollmentRecordPage({
  params,
}: EnrollmentRecordPageProps) {
  const { id: idParam } = await params;
  const id = Number.parseInt(idParam, 10);

  if (Number.isNaN(id)) {
    throw new Error('Invalid enrollment id.');
  }

  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Enrollment record overview'
        description='Review lifecycle status, dates, and staff notes, confirm the applicant and program, and open the intake assessment or enrollment contract when you need upstream context.'
        actions={
          <Button
            asChild
            variant='outline'
            className='bg-background hover:bg-muted h-10 shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            <Link
              href={ROUTES.ADMIN.MODULES.ENROLLMENT_RECORDS.LIST}
              aria-label='Back to enrollment records list'
            >
              <ArrowLeftIcon className='size-3.5' />
              Back to enrollment records
            </Link>
          </Button>
        }
      />

      <EnrollmentRecordDetailView enrollmentId={id} />
    </div>
  );
}
