'use client';

import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading2 from '@/components/shared/typography/Heading2';
import { useLanguage } from '@/context/LanguageContext';

const TestimonialsSection = () => {
  const { language, translate } = useLanguage();

  return (
    <SectionContainer id='testimonials-section' className='bg-background'>
      <div className='mx-auto max-w-3xl min-w-0 space-y-6 text-center'>
        <SectionBadge
          icon={null}
          text={translate('marketing.pages.home.testimonials.badge')}
        />

        <Heading2 lang={language} className='mx-auto text-center'>
          <span className='text-foreground'>
            {translate('marketing.pages.home.testimonials.title.black')}{' '}
          </span>
          <span className='text-brand-gradient bg-clip-text text-transparent'>
            {translate('marketing.pages.home.testimonials.title.gradient')}
          </span>
        </Heading2>

        <Body1 lang={language} className='mx-auto text-center'>
          {translate('marketing.pages.home.testimonials.description')}
        </Body1>
      </div>
    </SectionContainer>
  );
};

export default TestimonialsSection;
