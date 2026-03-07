'use client';

import GradientText from '@/components/site/shared/GradientText';
import SectionBadge from '@/components/site/shared/SectionBadge';
import SectionContainer from '@/components/site/shared/SectionContainer';
import { useLanguage } from '@/context/LanguageContext';

const TestimonialsSection = () => {
  const { language, translate } = useLanguage();
  const isMyanmar = language === 'my';

  return (
    <SectionContainer id='testimonials-section' className='bg-white'>
      <div className='mx-auto max-w-3xl space-y-6 text-center'>
        <SectionBadge
          icon={null}
          text={translate('site.home.testimonials.badge')}
        />

        <h2
          className={
            isMyanmar
              ? 'text-2xl font-bold leading-relaxed sm:text-3xl lg:text-4xl lg:leading-loose font-sans'
              : 'text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl font-sans'
          }
        >
          <span className='text-foreground block'>
            {translate('site.home.testimonials.title.black')}
          </span>
          <GradientText>
            {translate('site.home.testimonials.title.gradient')}
          </GradientText>
        </h2>

        <p
          className={
            isMyanmar
              ? 'text-foreground/80 text-base leading-loose sm:text-lg font-sans'
              : 'text-foreground/80 text-lg leading-relaxed font-sans'
          }
        >
          {translate('site.home.testimonials.description')}
        </p>
      </div>
    </SectionContainer>
  );
};

export default TestimonialsSection;
