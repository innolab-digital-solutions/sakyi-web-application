'use client';

import { useQuery } from '@tanstack/react-query';
import { Grid3X3 } from 'lucide-react';
import { useMemo, useState } from 'react';

import ProgramCard from '@/components/marketing/cards/ProgramCard';
import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading1 from '@/components/shared/typography/Heading1';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/context/LanguageContext';
import { getMarketingPrograms } from '@/domains/programs/services';
import type { Program } from '@/domains/programs/types';

const INITIAL_LIMIT = 4;

const ExploreProgramsSection = () => {
  const { language, translate } = useLanguage();
  const [showAll, setShowAll] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['programs', language],
    queryFn: () => getMarketingPrograms(language, 100),
    staleTime: 1000 * 60 * 5,
  });

  const publishedPrograms = useMemo(() => {
    if (data?.status !== 'success') return [];
    return (data.data as Program[]).filter((p) => p.status === 'published');
  }, [data]);

  const displayedPrograms = showAll
    ? publishedPrograms
    : publishedPrograms.slice(0, INITIAL_LIMIT);

  return (
    <SectionContainer id='explore-programs-section' className='bg-white'>
      {/* Header */}
      <div className='flex min-w-0 flex-col items-center justify-center space-y-6 text-center'>
        <SectionBadge
          icon={<Grid3X3 className='h-4 w-4' />}
          text={translate('marketing.pages.programs.explore-programs.badge')}
        />

        <Heading1 lang={language} className='mx-auto text-center'>
          <span className='text-foreground'>
            {translate(
              'marketing.pages.programs.explore-programs.title.black',
            )}{' '}
          </span>
          <span className='text-brand-gradient bg-clip-text text-transparent'>
            {translate(
              'marketing.pages.programs.explore-programs.title.gradient',
            )}
          </span>
        </Heading1>

        <Body1
          lang={language}
          className='mx-auto max-w-3xl text-center text-slate-600'
        >
          {translate('marketing.pages.programs.explore-programs.description')}
        </Body1>
      </div>

      {/* Error */}
      {isError && (
        <p className='mt-12 text-center text-slate-500'>{error?.message}</p>
      )}

      {/* Programs Grid */}
      <div className='mt-12 grid gap-8 lg:grid-cols-2'>
        {isLoading
          ? Array.from({ length: INITIAL_LIMIT }).map((_, i) => (
              <div
                key={i}
                className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'
              >
                <div className='flex flex-col gap-6'>
                  <Skeleton className='aspect-3/2 w-full rounded-xl' />
                  <div className='space-y-4'>
                    <Skeleton className='h-7 w-3/4' />
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-5/6' />
                    <Skeleton className='h-5 w-24' />
                  </div>
                </div>
              </div>
            ))
          : displayedPrograms.map((program, index) => (
              <ProgramCard key={program.id} program={program} index={index} />
            ))}
      </div>

      {/* Show More / Show Less */}
      {!isLoading && publishedPrograms.length > INITIAL_LIMIT && (
        <div className='mt-12 text-center'>
          <button
            onClick={() => setShowAll(!showAll)}
            className='group bg-brand-gradient inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl'
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {showAll
              ? translate('marketing.pages.programs.explore-programs.show-less')
              : translate(
                  'marketing.pages.programs.explore-programs.show-all',
                  {
                    count: String(publishedPrograms.length),
                  },
                )}
          </button>
        </div>
      )}
    </SectionContainer>
  );
};

export default ExploreProgramsSection;
