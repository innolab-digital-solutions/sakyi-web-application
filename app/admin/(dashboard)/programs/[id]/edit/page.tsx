import type { Metadata } from 'next';

import PageHeader from '@/components/admin/layout/PageHeader';
import ProgramForm from '@/components/admin/modules/programs/ProgramForm';

export const metadata: Metadata = {
  title: 'Edit program | SaKyi Admin',
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
        title='Edit program'
        description='Update program overview details and localized content, then save as draft or publish to reflect changes in the catalog.'
      />

      <ProgramForm mode='edit' programId={id} />
    </div>
  );
}
