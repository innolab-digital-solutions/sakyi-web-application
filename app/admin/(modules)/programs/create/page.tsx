import ProgramForm from '@/components/admin/modules/programs/ProgramForm';

export default function ProgramCreatePage() {
  return (
    <div className='space-y-8'>
      <div className='flex flex-col space-y-1.5'>
        <h1 className='text-foreground text-md font-bold'>Create Program</h1>
        <p className='text-muted-foreground text-sm font-medium'>
          Configure a new program, its goals, and translations.
        </p>
      </div>

      <ProgramForm mode='create' />
    </div>
  );
}
