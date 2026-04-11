'use client';

import { ArrowRight, ChevronRight, Heart, Mail } from 'lucide-react';

import PrimaryCtaLink from '@/components/marketing/buttons/PrimaryCtaLink';
import SecondaryCtaLink from '@/components/marketing/buttons/SecondaryCtaLink';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body2 from '@/components/shared/typography/Body2';
import Heading2 from '@/components/shared/typography/Heading2';
import { ROUTES } from '@/config/routes';
import { useLanguage } from '@/context/LanguageContext';

const CallToActionSection = () => {
  const { language, translate } = useLanguage();

  return (
    <SectionContainer
      id='about-cta-section'
      className='bg-linear-to-br from-[#35bec5] to-[#0c96c4]'
    >
      <div className='mb-10 space-y-6 text-center' data-aos='fade-up'>
        <Heading2 lang={language} className='text-white'>
          {translate('marketing.pages.about.call-to-action.title')}
        </Heading2>

        <Body2 lang={language} className='mx-auto max-w-2xl text-white'>
          {translate('marketing.pages.about.call-to-action.description')}
        </Body2>
      </div>

      <div
        className='flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-5'
        data-aos='fade-up'
        data-aos-delay='100'
      >
        <PrimaryCtaLink href={ROUTES.MARKETING.PROGRAMS}>
          <Heart className='mr-2 h-5 w-5' />
          <span className='relative z-10'>
            {translate('marketing.pages.about.call-to-action.cta.primary')}
          </span>
          <ArrowRight className='ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
        </PrimaryCtaLink>

        <SecondaryCtaLink href={ROUTES.MARKETING.CONTACT}>
          <Mail className='mr-2 h-5 w-5' />
          <span>
            {translate('marketing.pages.about.call-to-action.cta.secondary')}
          </span>
          <ChevronRight className='ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
        </SecondaryCtaLink>
      </div>
    </SectionContainer>
  );
};

export default CallToActionSection;
