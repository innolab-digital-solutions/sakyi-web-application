'use client';

import Link from 'next/link';

import GradientButton from '@/components/site/shared/GradientButton';
import GradientText from '@/components/site/shared/GradientText';
import SectionBadge from '@/components/site/shared/SectionBadge';
import SectionContainer from '@/components/site/shared/SectionContainer';
import PATHS from '@/config/paths';
import { useLanguage } from '@/context/LanguageContext';

const OurProgramsSection = () => {
  const { translate } = useLanguage();

  return (
    <SectionContainer id='our-programs-section' className='bg-white'>
      <div className='mx-auto max-w-3xl space-y-6 text-center'>
        <SectionBadge
          icon={null}
          text={translate('site.home.programs-overview.badge')}
        />

        <h2
          className='text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl'
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          <span className='text-foreground block'>
            {translate('site.home.programs-overview.title.black')}
          </span>
          <GradientText>
            {translate('site.home.programs-overview.title.gradient')}
          </GradientText>
        </h2>

        <p
          className='text-foreground/80 text-lg leading-relaxed'
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {translate('site.home.programs-overview.description')}
        </p>

        <div className='pt-4'>
          <Link href={PATHS.SITE.PROGRAMS} className='inline-block'>
            <GradientButton>
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
