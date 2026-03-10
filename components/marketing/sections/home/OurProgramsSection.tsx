'use client';

import Link from 'next/link';

import GradientButton from '@/components/marketing/buttons/GradientButton';
import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading2 from '@/components/shared/typography/Heading2';
import { ROUTES } from '@/config/routes';
import { useLanguage } from '@/context/LanguageContext';

const OurProgramsSection = () => {
  const { language, translate } = useLanguage();

  return (
    <SectionContainer id='our-programs-section' className='bg-white'>
      <div className='mx-auto max-w-3xl min-w-0 space-y-6 text-center'>
        <SectionBadge
          icon={null}
          text={translate('marketing.pages.home.programs-overview.badge')}
        />

        <Heading2 lang={language} className='mx-auto text-center'>
          <span className='text-foreground'>
            {translate('marketing.pages.home.programs-overview.title.black')}{' '}
          </span>
          <span className='text-brand-gradient bg-clip-text text-transparent'>
            {translate(
              'marketing.pages.home.programs-overview.title.gradient',
            )}
          </span>
        </Heading2>

        <Body1
          lang={language}
          className='mx-auto text-center'
        >
          {translate('marketing.pages.home.programs-overview.description')}
        </Body1>

        <div className='pt-4'>
          <Link
            href={ROUTES.MARKETING.PROGRAMS}
            className='inline-block w-full min-w-0 sm:w-auto'
          >
            <GradientButton className='w-full min-w-0 sm:w-auto'>
              <span>
                {translate(
                  'marketing.pages.home.programs-overview.cta.primary',
                )}
              </span>
            </GradientButton>
          </Link>
        </div>
      </div>
    </SectionContainer>
  );
};

export default OurProgramsSection;
