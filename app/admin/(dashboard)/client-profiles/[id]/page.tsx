import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import PageHeader from '@/components/admin/layout/PageHeader';
import ClientProfileDetailView from '@/components/admin/modules/client-profiles/ClientProfileDetailView';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Client Profile Overview',
  description:
    'Confirm reference and account identity, review wellness profile fields and uploaded media, and scan linked enrollment records before updates or outbound communication.',
};

type ClientProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientProfilePage({
  params,
}: ClientProfilePageProps) {
  const { id: idParam } = await params;
  const id = Number.parseInt(idParam, 10);

  if (Number.isNaN(id)) {
    throw new Error('Invalid client profile id.');
  }

  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Client profile overview'
        description='Confirm reference and account identity, review wellness profile fields and uploaded media, and scan linked enrollment records before updates or outbound communication.'
        actions={
          <Button
            asChild
            variant='outline'
            className='bg-background hover:bg-muted h-10 shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            <Link href={ROUTES.ADMIN.MODULES.CLIENT_PROFILES.LIST}>
              <ArrowLeftIcon className='size-3.5' />
              Back to Client Profiles
            </Link>
          </Button>
        }
      />

      <ClientProfileDetailView profileId={id} />
    </div>
  );
}
