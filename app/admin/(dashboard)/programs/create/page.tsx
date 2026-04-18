import type { Metadata } from 'next';

import PageHeader from '@/components/admin/layout/PageHeader';
import ProgramForm from '@/components/admin/modules/programs/ProgramForm';

export const metadata: Metadata = {
  title: 'Create program | SaKyi Admin',
  description:
    'Add a new care program: set duration, price, and goals on the overview step, then complete English and Myanmar content before publishing to the catalog.',
};

export default function ProgramCreatePage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Create program'
        description='Start from an empty draft, save overview details (thumbnail, duration, price, goals), then walk through content and structure in each language. Publish when the program is ready to appear in listings and enrollment flows.'
      />

      <ProgramForm mode='create' />
    </div>
  );
}
