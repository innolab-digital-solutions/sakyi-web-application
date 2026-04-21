import type { Metadata } from 'next';

import PageHeader from '@/components/admin/layout/PageHeader';
import ProgramForm from '@/components/admin/modules/programs/ProgramForm';

export const metadata: Metadata = {
  title: 'Create program | SaKyi Admin',
  description:
    'Create a care program with standardized pricing, goals, and localized content before publishing it to the catalog.',
};

export default function ProgramCreatePage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Create program'
        description='Create a new program by setting overview details first, then completing localized content before publishing.'
      />

      <ProgramForm mode='create' />
    </div>
  );
}
