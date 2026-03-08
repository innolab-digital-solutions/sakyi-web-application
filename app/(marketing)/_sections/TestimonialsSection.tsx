'use client';

import SectionBadge from '@/components/site/shared/SectionBadge';
import SectionContainer from '@/components/site/shared/SectionContainer';
import SectionDescription from '@/components/site/shared/SectionDescription';
import SectionTitle from '@/components/site/shared/SectionTitle';
import { useLanguage } from '@/context/LanguageContext';

const TestimonialsSection = () => {
  const { language, translate } = useLanguage();

  return (
    <SectionContainer id='testimonials-section' className='bg-white'>
      <div className='mx-auto max-w-3xl min-w-0 space-y-6 text-center'>
        <SectionBadge
          icon={null}
          text={translate('site.home.testimonials.badge')}
        />

        <SectionTitle
          as='h2'
          variant='section'
          language={language}
          blackPart={translate('site.home.testimonials.title.black')}
          gradientPart={translate('site.home.testimonials.title.gradient')}
          center
        />

        <SectionDescription language={language} center>
          {translate('site.home.testimonials.description')}
        </SectionDescription>
      </div>
    </SectionContainer>
  );
};

export default TestimonialsSection;
