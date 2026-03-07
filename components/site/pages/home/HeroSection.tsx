'use client';

import {
  ArrowRight,
  Brain,
  ChevronRight,
  Heart,
  Shield,
  Sparkles,
} from 'lucide-react';

import DecorativeImage from '@/components/site/shared/DecorativeImage';
import FloatingCard from '@/components/site/shared/FloatingCard';
import GradientButton from '@/components/site/shared/GradientButton';
import OutlineButton from '@/components/site/shared/OutlineButton';
import SectionBadge from '@/components/site/shared/SectionBadge';
import SectionContainer from '@/components/site/shared/SectionContainer';
import SectionDescription from '@/components/site/shared/SectionDescription';
import SectionTitle from '@/components/site/shared/SectionTitle';
import { useLanguage } from '@/context/LanguageContext';

const HeroSection = () => {
  const { language, translate } = useLanguage();

  return (
    <SectionContainer id='hero-section' className='bg-white'>
      <div className='grid min-w-0 items-center gap-12 lg:grid-cols-2 lg:gap-16'>
        {/* Left Column: Headline, descriptive text, and call-to-action buttons */}
        <div className='min-w-0 space-y-8'>
          <SectionBadge
            icon={<Sparkles className='h-4 w-4' />}
            text={translate('site.home.hero.badge')}
          />

          {/* Section Headline: Main marketing message with multi-line headline and subtitle */}
          <div className='space-y-6'>
            <SectionTitle
              as='h1'
              variant='hero'
              language={language}
              blackPart={translate('site.home.hero.title.black')}
              gradientPart={translate('site.home.hero.title.gradient')}
              subtitle={translate('site.home.hero.title.subtitle')}
            />

            <SectionDescription language={language} maxWidth>
              {translate('site.home.hero.description')}
            </SectionDescription>
          </div>

          {/* Call To Action Buttons: Start and Learn More */}
          <div className='flex min-w-0 flex-col gap-4 sm:flex-row'>
            <GradientButton className='w-full min-w-0 sm:w-auto'>
              <Heart className='h-5 w-5' />
              <span>{translate('site.home.hero.cta.primary')}</span>
              <ArrowRight className='h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
            </GradientButton>

            <OutlineButton className='w-full min-w-0 sm:w-auto'>
              <Brain className='h-5 w-5' />
              <span>{translate('site.home.hero.cta.secondary')}</span>
              <ChevronRight className='h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
            </OutlineButton>
          </div>
        </div>

        {/* Right Column: Main image and floating highlight cards for visual appeal */}
        <div className='relative min-w-0'>
          <div className='relative'>
            <DecorativeImage
              src='/images/home-hero.jpg'
              alt='Woman doing yoga meditation for wellness and mental health'
              width={600}
              height={600}
            />

            {/* Personalized Plans Floating Card */}
            <FloatingCard
              icon={<Heart className='h-5 w-5' />}
              title='Personalized Plans'
              description='Tailored to your needs'
              className='-top-6 -left-2 sm:-left-4 lg:-top-4 lg:-left-6'
              iconClassName='bg-linear-to-r from-[#35bec5] to-[#4bc4db]'
            />

            {/* Doctor Guided Floating Card */}
            <FloatingCard
              icon={<Shield className='h-5 w-5' />}
              title='Doctor Guided'
              description='Expert supervision'
              className='-right-2 -bottom-6 sm:-right-4 lg:-right-6'
              iconClassName='bg-linear-to-r from-[#4bc4db] to-[#0c96c4]'
            />
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};

export default HeroSection;
