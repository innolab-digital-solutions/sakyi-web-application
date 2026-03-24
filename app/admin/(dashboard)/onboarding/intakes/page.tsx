import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import IntakeListTable from '@/components/admin/modules/onboarding/IntakeListTable';

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
