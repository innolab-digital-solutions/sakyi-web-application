'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import PrimaryButton from '@/components/marketing/buttons/PrimaryButton';
import ContentEmptyState from '@/components/marketing/cards/ContentEmptyState';
import ProgramCard from '@/components/marketing/cards/ProgramCard';
import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading2 from '@/components/shared/typography/Heading2';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/config/routes';
import { useLanguage } from '@/context/LanguageContext';
import { getMarketingPrograms } from '@/domains/programs/services';
import type { Program } from '@/domains/programs/types';

const OurProgramsSection = () => {
  const { language, translate } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ['programs-home', language],
    queryFn: () => getMarketingPrograms(language, 3),
    staleTime: 1000 * 60 * 5,
  });

  const programs =
    data?.status === 'success'
      ? (data.data as Program[]).filter((p) => p.status === 'published')
      : [];

  return (
    <SectionContainer id='our-programs-section' className='bg-background'>
      <div
        className='mx-auto max-w-3xl min-w-0 space-y-6 text-center'
        data-aos='fade-up'
      >
        <SectionBadge
          icon={null}
          text={translate('marketing.pages.home.programs-overview.badge')}
        />

        <Heading2 lang={language} className='mx-auto text-center'>
          <span className='text-foreground'>
            {translate(
              'marketing.pages.home.programs-overview.title.black',
            )}{' '}
          </span>
          <span className='text-brand-gradient bg-clip-text text-transparent'>
            {translate('marketing.pages.home.programs-overview.title.gradient')}
          </span>
        </Heading2>

        <Body1 lang={language} className='mx-auto text-center'>
          {translate('marketing.pages.home.programs-overview.description')}
        </Body1>
      </div>

      {/* Programs Grid */}
      {isLoading ? (
        <div className='mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch'>
          <div className='group relative h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
            <div className='flex flex-col gap-6'>
              <Skeleton className='aspect-square w-full rounded-xl bg-slate-200/70' />
              <div className='flex w-full flex-col justify-center space-y-4'>
                <Skeleton className='h-8 w-3/5' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-[92%]' />
                <Skeleton className='h-4 w-4/5' />
                <div className='pt-2'>
                  <Skeleton className='h-4 w-28' />
                </div>
              </div>
            </div>
          </div>

          <div className='grid h-full grid-rows-2 gap-6'>
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className='group relative h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'
              >
                <div className='flex h-full flex-col gap-4 sm:flex-row'>
                  <Skeleton className='h-40 w-full rounded-xl bg-slate-200/70 sm:h-full sm:w-2/5' />
                  <div className='flex w-full flex-col justify-center space-y-3 sm:w-3/5'>
                    <Skeleton className='h-6 w-4/5' />
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-[90%]' />
                    <div className='pt-1'>
                      <Skeleton className='h-4 w-24' />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : programs.length > 0 ? (
        <div className='mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch'>
          {/* Left — first program, tall vertical card */}
          <ProgramCard program={programs[0]} index={0} className='h-full' />

          {/* Right — second and third programs stacked horizontally */}
          <div className='grid grid-rows-2 gap-6'>
            {programs.slice(1, 3).map((program, index) => (
              <ProgramCard
                key={program.id}
                program={program}
                index={index + 1}
                variant='horizontal'
              />
            ))}
          </div>
        </div>
      ) : null}

      {!isLoading && programs.length === 0 && (
        <div className='mt-12'>
          <ContentEmptyState
            title='Programs are being prepared'
            description='Our care team is curating wellness programs right now. Please check back shortly.'
          />
        </div>
      )}

      {/* CTA */}
      {!isLoading && programs.length > 0 && (
        <div className='mt-12 text-center'>
          <Link
            href={ROUTES.MARKETING.PROGRAMS}
            className='inline-block w-full min-w-0 sm:w-auto'
          >
            <PrimaryButton className='w-full min-w-0 sm:w-auto'>
              <span>
                {translate(
                  'marketing.pages.home.programs-overview.cta.primary',
                )}
              </span>
              <ArrowRight className='h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
            </PrimaryButton>
          </Link>
        </div>
      )}
    </SectionContainer>
  );
};

export default OurProgramsSection;
