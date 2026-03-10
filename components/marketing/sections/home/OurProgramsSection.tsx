'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import PrimaryButton from '@/components/marketing/buttons/PrimaryButton';
import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading2 from '@/components/shared/typography/Heading2';
import { ROUTES } from '@/config/routes';
import { useLanguage } from '@/context/LanguageContext';
import { getPrograms } from '@/domains/programs/services/marketing.service';
import { Program } from '@/domains/programs/types';

const OurProgramsSection = () => {
  const { language, translate } = useLanguage();

  const { data: programs } = useQuery<Program[]>({
    queryKey: ['programs'],
    queryFn: async (): Promise<Program[]> => {
      const response = await getPrograms();
      return response.data as Program[];
    },
  });

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

        <div>
          {programs?.map((program: Program) => (
            <div key={program.id}>
              <h3>{program.title}</h3>
              <p>{program.description}</p>
            </div>
          ))}
        </div>

        <div className='pt-4'>
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
      </div>
    </SectionContainer>
  );
};

export default OurProgramsSection;
