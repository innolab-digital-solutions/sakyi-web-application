import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import PageHeader from '@/components/admin/layout/PageHeader';
import ProgramForm from '@/components/admin/modules/programs/ProgramForm';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Edit Care Program | SaKyi Admin',
  description:
    'Update an existing care program so catalog details, goals, pricing, and localized content remain accurate.',
};

type ProgramEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProgramEditPage({
  params,
}: ProgramEditPageProps) {
  const { id: idParam } = await params;
  const id = Number.parseInt(idParam, 10);

  if (Number.isNaN(id)) {
    throw new Error('Invalid program id.');
  }

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Edit Care Program'
        description='Update this care program’s overview, pricing, goals, and localized content, then save as draft or publish to keep the catalog current.'
        actions={
          <Button
            asChild
            type='button'
            variant='outline'
            className='text-foreground bg-background hover:bg-muted h-10 shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            <Link href={ROUTES.ADMIN.MODULES.PROGRAMS.LIST}>
              <ArrowLeftIcon className='size-3.5' />
              Back to Programs
            </Link>
          </Button>
        }
      />

      <ProgramForm mode='edit' programId={id} />
    </div>
  );
}
