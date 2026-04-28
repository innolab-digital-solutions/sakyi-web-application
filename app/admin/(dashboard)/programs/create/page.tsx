import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import PageHeader from '@/components/admin/layout/PageHeader';
import ProgramForm from '@/components/admin/modules/programs/ProgramForm';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Create Care Program | SaKyi Admin',
  description:
    'Create a care program by defining pricing, goals, and localized content so the listing is complete, consistent, and ready to publish.',
};

export default function ProgramCreatePage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Create Care Program'
        description='Create a care program by defining pricing, goals, and localized content so the listing is complete, consistent, and ready to publish.'
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

      <ProgramForm mode='create' />
    </div>
  );
}
