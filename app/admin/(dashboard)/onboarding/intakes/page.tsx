import { PlusIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import IntakeListTable from '@/components/admin/modules/onboarding/IntakeListTable';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Onboarding Intakes | SaKyi Admin',
  description: 'Admin onboarding queue for client intake workflows.',
};

export default function OnboardingIntakesPage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Onboarding intakes'
        description='Queue for admin-led phone intakes. Start a new session or continue one in progress—progress is saved per section.'
        actions={
          <Button asChild size='lg'>
            <Link href={ROUTES.ADMIN.MODULES.ONBOARDING.INTAKES.CREATE}>
              <PlusIcon className='size-4' />
              Start intake
            </Link>
          </Button>
        }
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground text-sm'>Loading...</div>
        }
      >
        <IntakeListTable />
      </Suspense>
    </div>
  );
}
