import AdminPageHeader from '@/components/admin/layout/PageHeader';
import ProgramForm from '@/components/admin/modules/programs/ProgramForm';
import { getProgramById } from '@/domains/programs/services/admin.service';

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

  const response = await getProgramById(id);

  if (response.status === 'error') {
    throw new Error(response.message);
  }

  const program = response.data;

  return (
    <div className='space-y-8'>
      <AdminPageHeader
        title='Edit Program'
        description='Update program details, status, and translations.'
      />

      <ProgramForm mode='edit' program={program} />
    </div>
  );
}
