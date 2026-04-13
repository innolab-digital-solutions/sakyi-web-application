'use client';

import {
  ArrowRight,
  Brain,
  ChevronRight,
  Heart,
  Shield,
  Sparkles,
} from 'lucide-react';

import PrimaryButton from '@/components/marketing/buttons/PrimaryButton';
import SecondaryButton from '@/components/marketing/buttons/SecondaryButton';
import FloatingCard from '@/components/marketing/cards/FloatingCard';
import DecorativeImage from '@/components/marketing/DecorativeImage';
import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Body2 from '@/components/shared/typography/Body2';
import Heading1 from '@/components/shared/typography/Heading1';
import { useLanguage } from '@/context/LanguageContext';

const HomeIntroSection = () => {
  const { language, translate } = useLanguage();

  return (
    <SectionContainer id='hero-section' className='bg-white'>
      <div className='grid min-w-0 items-center gap-12 lg:grid-cols-2 lg:gap-16'>
        {/* Left side: Text and CTAs */}
        <div className='min-w-0 space-y-8' data-aos='fade-right'>
          {/* Hero badge at the top */}
          <SectionBadge
            icon={<Sparkles className='h-4 w-4' />}
            text={translate('marketing.pages.home.hero.badge')}
          />

          <div className='space-y-6'>
            {/* Main hero title (with gradient highlight) */}
            <div className='space-y-2'>
              <Heading1 lang={language}>
                <span className='text-foreground block font-sans'>
                  {translate('marketing.pages.home.hero.title.black')}
                </span>
                <span className='text-brand-gradient block bg-clip-text font-sans text-transparent'>
                  {translate('marketing.pages.home.hero.title.gradient')}
                </span>
              </Heading1>

              <Body2
                lang={language}
                className='block text-xl font-light text-slate-600 sm:text-2xl'
              >
                {translate('marketing.pages.home.hero.title.subtitle')}
              </Body2>
            </div>

            {/* Hero section description */}
            <Body1 lang={language} className='max-w-2xl'>
              {translate('marketing.pages.home.hero.description')}
            </Body1>
          </div>

          {/* Primary and secondary CTAs */}
          <div className='flex min-w-0 flex-col gap-4 sm:flex-row'>
            <PrimaryButton className='w-full min-w-0 sm:w-auto'>
              <Heart className='h-5 w-5' />
              <span>{translate('marketing.pages.home.hero.cta.primary')}</span>
              <ArrowRight className='h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
            </PrimaryButton>

            <SecondaryButton className='w-full min-w-0 sm:w-auto'>
              <Brain className='h-5 w-5' />
              <span>
                {translate('marketing.pages.home.hero.cta.secondary')}
              </span>
              <ChevronRight className='h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
            </SecondaryButton>
          </div>
        </div>

        {/* Right side: Hero image and floating cards */}
        <div className='relative min-w-0' data-aos='fade-left'>
          {/* Hero decorative image */}
          <DecorativeImage
            src='/images/home-hero.jpg'
            alt='Group of adults doing outdoor stretching and exercise in a park for wellness and health'
            width={600}
            height={600}
          />

          {/* Floating card: Personalized Plans */}
          <FloatingCard
            icon={<Heart className='h-5 w-5' />}
            title='Personalized Plans'
            description='Tailored to your needs'
            className='-top-6 -left-2 sm:-left-4 lg:-top-4 lg:-left-6'
            iconClassName='bg-linear-to-r from-[#35bec5] to-[#4bc4db]'
          />

          {/* Floating card: Doctor Guided */}
          <FloatingCard
            icon={<Shield className='h-5 w-5' />}
            title='Doctor Guided'
            description='Expert supervision'
            className='-right-2 -bottom-6 sm:-right-4 lg:-right-6'
            iconClassName='bg-linear-to-r from-[#4bc4db] to-[#0c96c4]'
          />
        </div>
      </div>
    </SectionContainer>
  );
};

export default HomeIntroSection;
