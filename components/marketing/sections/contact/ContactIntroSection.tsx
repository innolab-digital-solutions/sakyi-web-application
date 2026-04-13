'use client';

import {
  ArrowRight,
  Brain,
  ChevronRight,
  Heart,
  MessageCircle,
} from 'lucide-react';

import PrimaryButton from '@/components/marketing/buttons/PrimaryButton';
import SecondaryButton from '@/components/marketing/buttons/SecondaryButton';
import FloatingCard from '@/components/marketing/cards/FloatingCard';
import DecorativeImage from '@/components/marketing/DecorativeImage';
import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading1 from '@/components/shared/typography/Heading1';
import { useLanguage } from '@/context/LanguageContext';

const ContactIntroSection = () => {
  const { language, translate } = useLanguage();

  return (
    <SectionContainer id='contact-intro-section' className='bg-white'>
      <div className='grid min-w-0 items-center gap-12 lg:grid-cols-2 lg:gap-16'>
        {/* Left side: Text and CTAs */}
        <div className='min-w-0 space-y-8' data-aos='fade-right'>
          {/* Hero badge at the top */}
          <SectionBadge
            icon={<MessageCircle className='h-4 w-4' />}
            text={translate('marketing.pages.contact.hero.badge')}
          />

          <div className='space-y-6'>
            {/* Main hero title (with gradient highlight) */}
            <Heading1 lang={language}>
              <span className='text-foreground block font-sans'>
                {translate('marketing.pages.contact.hero.title.black')}
              </span>
              <span className='text-brand-gradient block bg-clip-text font-sans leading-relaxed text-transparent'>
                {translate('marketing.pages.contact.hero.title.gradient')}
              </span>
            </Heading1>

            {/* Hero section description */}
            <Body1 lang={language} className='max-w-2xl'>
              {translate('marketing.pages.contact.hero.description')}
            </Body1>
          </div>

          {/* Primary and secondary CTAs */}
          <div className='flex min-w-0 flex-col gap-4 sm:flex-row'>
            <PrimaryButton className='w-full min-w-0 sm:w-auto'>
              <Heart className='h-5 w-5' />
              <span>
                {translate('marketing.pages.contact.hero.cta.primary')}
              </span>
              <ArrowRight className='h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
            </PrimaryButton>

            <SecondaryButton className='w-full min-w-0 sm:w-auto'>
              <Brain className='h-5 w-5' />
              <span>
                {translate('marketing.pages.contact.hero.cta.secondary')}
              </span>
              <ChevronRight className='h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
            </SecondaryButton>
          </div>
        </div>

        {/* Right side: Hero image and floating cards */}
        <div className='relative min-w-0' data-aos='fade-left'>
          {/* Hero decorative image */}
          <DecorativeImage
            src='/images/contact-hero.jpg'
            alt='Smiling woman on headset waving during online wellness consultation over video call'
            width={600}
            height={600}
          />

          {/* Floating card: Quick Response */}
          <FloatingCard
            icon={<Heart className='h-5 w-5' />}
            title='Quick Response'
            description='We reply within 24 hours'
            className='right-6 bottom-6 left-6'
            iconClassName='bg-linear-to-r from-[#35bec5] to-[#4bc4db]'
          />
        </div>
      </div>
    </SectionContainer>
  );
};

export default ContactIntroSection;
