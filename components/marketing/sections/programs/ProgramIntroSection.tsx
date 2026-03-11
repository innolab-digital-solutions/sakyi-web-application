'use client';

import { ChevronDown, Heart, Sparkles } from 'lucide-react';

import PrimaryButton from '@/components/marketing/buttons/PrimaryButton';
import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading1 from '@/components/shared/typography/Heading1';
import { useLanguage } from '@/context/LanguageContext';
import { scrollToElement } from '@/lib/utils/scroll';

const ProgramIntroSection = () => {
  const { language, translate } = useLanguage();

  return (
    <SectionContainer id='program-intro-section' className='bg-white'>
      <div className='flex min-w-0 flex-col items-center justify-center space-y-6 text-center'>
        <SectionBadge
          icon={<Sparkles className='h-4 w-4' />}
          text={translate('marketing.pages.programs.hero.badge')}
        />

        <Heading1 lang={language} className='mx-auto text-center'>
          <span className='text-foreground'>
            {translate('marketing.pages.programs.hero.title.black')}{' '}
          </span>
          <span className='text-brand-gradient bg-clip-text text-transparent'>
            {translate('marketing.pages.programs.hero.title.gradient')}
          </span>
        </Heading1>

        <Body1
          lang={language}
          className='mx-auto max-w-3xl text-center text-slate-600'
        >
          {translate('marketing.pages.programs.hero.description')}
        </Body1>

        <div className='flex flex-col items-center pt-4 sm:flex-row sm:justify-center'>
          <PrimaryButton
            onClick={() => scrollToElement('explore-programs-section')}
          >
            <Heart className='h-5 w-5' />
            <span>
              {translate('marketing.pages.programs.hero.cta.primary')}
            </span>
            <ChevronDown className='h-5 w-5 transition-transform duration-300 group-hover:translate-y-1' />
          </PrimaryButton>
        </div>
      </div>
    </SectionContainer>
  );
};

export default ProgramIntroSection;
