import type { Metadata } from 'next';

import PageHeader from '@/components/admin/layout/PageHeader';
import ProgramForm from '@/components/admin/modules/programs/ProgramForm';

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
      />

      <ProgramForm mode='edit' programId={id} />
    </div>
  );
}
