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
