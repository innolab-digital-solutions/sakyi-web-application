'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import PrimaryButton from '@/components/marketing/buttons/PrimaryButton';
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
    <SectionContainer id='our-programs-section' className='bg-white'>
      <div className='mx-auto max-w-3xl min-w-0 space-y-6 text-center'>
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
      <div className='mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
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
          : programs.map((program, index) => (
              <ProgramCard key={program.id} program={program} index={index} />
            ))}
      </div>

      {/* CTA */}
      <div className='mt-12 text-center'>
        <Link
          href={ROUTES.MARKETING.PROGRAMS}
          className='inline-block w-full min-w-0 sm:w-auto'
        >
          <PrimaryButton className='w-full min-w-0 sm:w-auto'>
            <span>
              {translate('marketing.pages.home.programs-overview.cta.primary')}
            </span>
            <ArrowRight className='h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
          </PrimaryButton>
        </Link>
      </div>
    </SectionContainer>
  );
};

export default OurProgramsSection;
