import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import PageHeader from '@/components/admin/layout/PageHeader';
import EnrollmentRequestDetailView from '@/components/admin/modules/enrollment-requests/EnrollmentRequestDetailView';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Enrollment request | SaKyi Admin',
  description:
    'Review a single enrollment request: applicant, requested program, handler, status, and linked intake.',
};

type EnrollmentRequestDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EnrollmentRequestDetailPage({
  params,
}: EnrollmentRequestDetailPageProps) {
  const { id: idParam } = await params;
  const id = Number.parseInt(idParam, 10);

  if (Number.isNaN(id)) {
    throw new Error('Invalid enrollment request id.');
  }

  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Enrollment request'
        description='Full context for this submission: who applied, which program they want, how the case was handled, and any linked intake assessment.'
        actions={
          <Button
            asChild
            variant='outline'
            className='bg-background hover:bg-muted h-10 shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            <Link href={ROUTES.ADMIN.MODULES.ENROLLMENT_REQUESTS.LIST}>
              <ArrowLeftIcon className='size-3.5' />
              Back to enrollment requests
            </Link>
          </Button>
        }
      />

      <EnrollmentRequestDetailView requestId={id} />
    </div>
  );
}
