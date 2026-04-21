import type { Metadata } from 'next';

import PageHeader from '@/components/admin/layout/PageHeader';
import ProgramForm from '@/components/admin/modules/programs/ProgramForm';

export const metadata: Metadata = {
  title: 'Create program | SaKyi Admin',
  description:
    'Create a care program by defining pricing, goals, and localized content so the listing is complete, consistent, and ready to publish.',
};

export default function ProgramCreatePage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Create program'
        description='Create a care program by defining pricing, goals, and localized content so the listing is complete, consistent, and ready to publish.'
      />

      <ProgramForm mode='create' />
    </div>
  );
}
