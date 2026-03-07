'use client';

import Link from 'next/link';

import GradientButton from '@/components/site/shared/GradientButton';
import SectionBadge from '@/components/site/shared/SectionBadge';
import SectionContainer from '@/components/site/shared/SectionContainer';
import SectionDescription from '@/components/site/shared/SectionDescription';
import SectionTitle from '@/components/site/shared/SectionTitle';
import PATHS from '@/config/paths';
import { useLanguage } from '@/context/LanguageContext';

const OurProgramsSection = () => {
  const { language, translate } = useLanguage();

  return (
    <SectionContainer id='our-programs-section' className='bg-white'>
      <div className='mx-auto min-w-0 max-w-3xl space-y-6 text-center'>
        <SectionBadge
          icon={null}
          text={translate('site.home.programs-overview.badge')}
        />

        <SectionTitle
          as='h2'
          variant='section'
          language={language}
          blackPart={translate('site.home.programs-overview.title.black')}
          gradientPart={translate('site.home.programs-overview.title.gradient')}
          center
        />

        <SectionDescription language={language} center>
          {translate('site.home.programs-overview.description')}
        </SectionDescription>

        <div className='pt-4'>
          <Link href={PATHS.SITE.PROGRAMS} className='inline-block w-full min-w-0 sm:w-auto'>
            <GradientButton className='w-full min-w-0 sm:w-auto'>
              <span>
                {translate('site.home.programs-overview.cta.primary')}
              </span>
            </GradientButton>
          </Link>
        </div>
      </div>
    </SectionContainer>
  );
};

export default OurProgramsSection;
