'use client';

import { Quote } from 'lucide-react';

import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import TestimonialsCarousel from '@/components/marketing/TestimonialsCarousel';
import Body1 from '@/components/shared/typography/Body1';
import Heading2 from '@/components/shared/typography/Heading2';
import { useLanguage } from '@/context/LanguageContext';
import { useTestimonials } from '@/hooks/use-testimonials';

const TestimonialsSection = () => {
  const { language, translate } = useLanguage();
  const testimonials = useTestimonials();

  // Nothing to show: skip the section rather than render a bare heading.
  if (testimonials.length === 0) return null;

  return (
    <SectionContainer id='testimonials-section' className='bg-white'>
      <div
        className='mx-auto max-w-3xl min-w-0 space-y-6 text-center'
        data-aos='fade-up'
      >
        <SectionBadge
          icon={<Quote className='h-4 w-4' />}
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

      <div className='mt-14' data-aos='fade-up' data-aos-delay='100'>
        <TestimonialsCarousel testimonials={testimonials} />
      </div>
    </SectionContainer>
  );
};

export default TestimonialsSection;
