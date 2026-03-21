import type { AdminProgram } from '@/domains/programs/types';

type ProgramFormProps = {
  mode: 'create' | 'edit';
  program?: AdminProgram;
};

/**
 * Admin program create/edit shell. Wire to `@/lib/form` and
 * `@/domains/programs/schemas` (`ProgramCreateSchema` / `ProgramUpdateSchema`)
 * when implementing full CRUD.
 */
export default function ProgramForm({ mode, program }: ProgramFormProps) {
  return (
    <div className='text-muted-foreground rounded-lg border border-dashed p-8 text-sm'>
      <p className='font-medium text-foreground'>
        {mode === 'create'
          ? 'Create program'
          : `Edit program: ${program?.title ?? '—'}`}
      </p>
      <p className='mt-2'>
        Replace this placeholder with a form that uses{' '}
        <code className='text-xs'>@/hooks/form</code> and the program create/update
        schemas.
      </p>
    </div>
  );
}
