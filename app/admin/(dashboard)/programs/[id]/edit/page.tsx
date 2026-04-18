import AdminPageHeader from '@/components/admin/layout/PageHeader';
import ProgramForm from '@/components/admin/modules/programs/ProgramForm';

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
      <AdminPageHeader
        title='Edit Program'
        description='Update program details, status, and translations.'
      />

      <ProgramForm mode='edit' programId={id} />
    </div>
  );
}
