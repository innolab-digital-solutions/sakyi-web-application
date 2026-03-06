'use client';

import { useLanguage } from '@/context/LanguageContext';
import GradientText from '@/components/site/shared/GradientText';
import SectionBadge from '@/components/site/shared/SectionBadge';
import SectionContainer from '@/components/site/shared/SectionContainer';

const TestimonialsSection = () => {
  const { translate } = useLanguage();

  return (
    <SectionContainer id='testimonials-section' className='bg-white'>
      <div className='mx-auto max-w-3xl text-center space-y-6'>
        <SectionBadge
          icon={null}
          text={translate('site.home.testimonials.badge')}
        />

        <h2
          className='text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl'
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          <span className='text-foreground block'>
            {translate('site.home.testimonials.title.black')}
          </span>
          <GradientText>
            {translate('site.home.testimonials.title.gradient')}
          </GradientText>
        </h2>

        <p
          className='text-foreground/80 text-lg leading-relaxed'
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {translate('site.home.testimonials.description')}
        </p>
      </div>
    </SectionContainer>
  );
};

export default TestimonialsSection;

