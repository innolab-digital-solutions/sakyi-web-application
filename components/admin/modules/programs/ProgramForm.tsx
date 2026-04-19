'use client';

import { useQueries } from '@tanstack/react-query';

import { getProgramById } from '@/domains/programs/services';
import type {
  Program,
  ProgramTranslation,
} from '@/domains/programs/types/admin';

import ProgramWizard from './ProgramWizard';

type ProgramFormProps =
  | { mode: 'create' }
  | { mode: 'edit'; programId: number };

function programLocaleToTranslation(
  p: Program,
  locale: 'en' | 'my',
): ProgramTranslation {
  return {
    locale,
    title: p.title ?? '',
    tagline: p.tagline ?? '',
    excerpt: p.excerpt ?? '',
    about: p.about ?? '',
    features: p.features ?? [],
    ideals: p.ideals ?? [],
    expectations: p.expectations ?? [],
    structures: (p.structures ?? []).map((s) => ({
      period: s.period ?? '',
      title: s.title ?? '',
      description: s.description ?? '',
    })),
  };
}

/**
 * Create: opens the unified program form.
 * Edit: loads English and Myanmar `Program` payloads and merges into one form.
 */
export default function ProgramForm(props: ProgramFormProps) {
  if (props.mode === 'create') {
    return <ProgramWizard mode='create' />;
  }
  return <ProgramEditLoader programId={props.programId} />;
}

function ProgramEditLoader({ programId }: { programId: number }) {
  const [enQuery, myQuery] = useQueries({
    queries: [
      {
        queryKey: ['program-admin-detail', programId, 'en'] as const,
        queryFn: async () => {
          const res = await getProgramById(programId, { locale: 'en' });
          if (res.status === 'error') {
            throw new Error(res.message ?? 'Failed to load program.');
          }
          return res.data;
        },
      },
      {
        queryKey: ['program-admin-detail', programId, 'my'] as const,
        queryFn: async () => {
          const res = await getProgramById(programId, { locale: 'my' });
          if (res.status === 'error') {
            throw new Error(res.message ?? 'Failed to load program.');
          }
          return res.data;
        },
      },
    ],
  });

  if (enQuery.isPending || myQuery.isPending) {
    return <p className='text-muted-foreground text-sm'>Loading program…</p>;
  }

  if (
    enQuery.isError ||
    myQuery.isError ||
    enQuery.data == null ||
    myQuery.data == null
  ) {
    return (
      <p className='text-destructive text-sm'>
        Could not load program data. Refresh the page and try again.
      </p>
    );
  }

  const enProgram = enQuery.data;
  const myProgram = myQuery.data;

  const enTranslation = programLocaleToTranslation(enProgram, 'en');
  const myTranslation = programLocaleToTranslation(myProgram, 'my');

  return (
    <ProgramWizard
      key={programId}
      mode='edit'
      program={enProgram}
      enTranslation={enTranslation}
      myTranslation={myTranslation}
    />
  );
}
