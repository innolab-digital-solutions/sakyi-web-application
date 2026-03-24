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
        title='Onboarding Intakes'
        description='Track draft, in-progress, completed, and cancelled onboarding intakes.'
      />
      <Suspense fallback={<div className='text-muted-foreground text-sm'>Loading...</div>}>
        <IntakeListTable />
      </Suspense>
    </div>
  );
}
