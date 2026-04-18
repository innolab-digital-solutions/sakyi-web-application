'use client';

import { useQuery } from '@tanstack/react-query';

import { ENDPOINTS } from '@/config/api/endpoints';
import { getProgramById } from '@/domains/programs/services';

import ProgramWizard from './ProgramWizard';

type ProgramFormProps =
  | { mode: 'create' }
  | { mode: 'edit'; programId: number };

/**
 * For create mode: renders the wizard directly.
 * For edit mode: fetches program data (including all translations) client-side
 * to avoid Sanctum cookie auth issues in server components.
 */
export default function ProgramForm(props: ProgramFormProps) {
  if (props.mode === 'create') {
    return <ProgramWizard mode='create' />;
  }
  return <ProgramEditLoader programId={props.programId} />;
}

function ProgramEditLoader({ programId }: { programId: number }) {
  const { data, isPending, isError } = useQuery({
    queryKey: [ENDPOINTS.ADMIN.MODULES.PROGRAMS.DETAIL(String(programId))],
    queryFn: async () => {
      const res = await getProgramById(programId);
      if (res.status === 'error') {
        throw new Error(res.message ?? 'Failed to load program.');
      }
      return res.data;
    },
  });

  if (isPending) {
    return <p className='text-muted-foreground text-sm'>Loading program…</p>;
  }

  if (isError || !data) {
    return (
      <p className='text-destructive text-sm'>
        Could not load program data. Refresh the page and try again.
      </p>
    );
  }

  const enTranslation = data.translations?.find((t) => t.locale === 'en');
  const myTranslation = data.translations?.find((t) => t.locale === 'my');

  return (
    <ProgramWizard
      mode='edit'
      program={data}
      enTranslation={enTranslation}
      myTranslation={myTranslation}
    />
  );
}
