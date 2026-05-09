import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import PageHeader from '@/components/admin/layout/PageHeader';
import EnrollmentRequestDetailView from '@/components/admin/modules/enrollment-requests/EnrollmentRequestDetailView';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Enrollment request overview | SaKyi Admin',
  description:
    'Review submission details, applicant and program context, pipeline status (intake, contract, enrollment), handler assignment, and links into related admin records.',
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
        title='Enrollment request overview'
        description='Review who applied, what program they selected, and how far they are through onboarding. Open the client profile, intake, contract, or enrollment when you need the full record.'
        actions={
          <Button
            asChild
            variant='outline'
            className='bg-background hover:bg-muted h-10 shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            <Link
              href={ROUTES.ADMIN.MODULES.ENROLLMENT_REQUESTS.LIST}
              aria-label='Back to enrollment requests list'
            >
              <ArrowLeftIcon className='size-3.5' />
              Back to requests
            </Link>
          </Button>
        }
      />

      <EnrollmentRequestDetailView requestId={id} />
    </div>
  );
}
