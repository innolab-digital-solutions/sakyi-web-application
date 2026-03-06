import ProgramForm from '@/components/admin/modules/programs/ProgramForm';
import ENDPOINTS from '@/config/endpoints';
import { http } from '@/lib/api/client';
import type { Program } from '@/types/admin/program';

type ProgramEditPageProps = {
  params: {
    id: string;
  };
};

export default async function ProgramEditPage({ params }: ProgramEditPageProps) {
  const id = Number.parseInt(params.id, 10);

  if (Number.isNaN(id)) {
    throw new Error('Invalid program id.');
  }

  const response = await http.get<Program>(
    ENDPOINTS.ADMIN.PROGRAMS.DETAIL.replace('{id}', String(id)),
  );

  if (response.status === 'error') {
    throw new Error(response.message);
  }

  const program = response.data;

  return (
    <div className='space-y-8'>
      <div className='flex flex-col space-y-1.5'>
        <h1 className='text-foreground text-md font-bold'>Edit Program</h1>
        <p className='text-muted-foreground text-sm font-medium'>
          Update program details, status, and translations.
        </p>
      </div>

      <ProgramForm mode='edit' program={program} />
    </div>
  );
}
