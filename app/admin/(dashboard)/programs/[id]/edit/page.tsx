import type { Metadata } from 'next';

import PageHeader from '@/components/admin/layout/PageHeader';
import ProgramForm from '@/components/admin/modules/programs/ProgramForm';

export const metadata: Metadata = {
  title: 'Edit program | SaKyi Admin',
  description:
    'Update an existing care program: adjust overview, bilingual copy, pricing, and goals; save or publish so the catalog and linked enrollments reflect your changes.',
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
        description='Use the wizard to change overview settings (thumbnail, duration, price, goals) and all bilingual content. Save your work as a draft or publish when the catalog and any linked enrollment flows should show the updated program.'
      />

      <ProgramForm mode='edit' programId={id} />
    </div>
  );
}
