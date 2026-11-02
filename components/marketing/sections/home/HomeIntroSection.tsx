'use client';

import {
  ArrowRight,
  Brain,
  ChevronRight,
  Heart,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import PrimaryButton from '@/components/marketing/buttons/PrimaryButton';
import SecondaryButton from '@/components/marketing/buttons/SecondaryButton';
import FloatingCard from '@/components/marketing/cards/FloatingCard';
import DecorativeImage from '@/components/marketing/DecorativeImage';
import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Body2 from '@/components/shared/typography/Body2';
import Heading1 from '@/components/shared/typography/Heading1';
import { ROUTES } from '@/config/routes';
import { useLanguage } from '@/context/LanguageContext';
import { scrollToElement } from '@/lib/utils/scroll';
import { cn } from '@/lib/utils/styles';

const HomeIntroSection = () => {
  const { language, translate } = useLanguage();
  const router = useRouter();
  const isMyanmar = language === 'my';

  return (
    <SectionContainer id='hero-section' className='bg-background'>
      <div className='grid min-w-0 items-center gap-12 lg:grid-cols-2 lg:gap-16'>
        {/* Left side: Text and CTAs */}
        <div className='min-w-0 space-y-8' data-aos='fade-right'>
          {/* Hero badge at the top */}
          <SectionBadge
            icon={<Sparkles className='h-4 w-4' />}
            text={translate('marketing.pages.home.hero.badge')}
          />

          <div className='min-w-0 space-y-6'>
            {/* Main hero title (with gradient highlight) */}
            <div className='min-w-0 space-y-2'>
              <Heading1
                lang={language}
                className={cn(
                  // Myanmar glyphs are wider than Latin. Keep equal 50/50 columns
                  // (same image side as English) and step the hero size down so
                  // the dark phrase fits one line without spilling under the image.
                  // Avoid leading-tight — it clips marks and hollows gradient text.
                  isMyanmar &&
                    'text-3xl leading-relaxed tracking-normal sm:text-4xl lg:text-[1.875rem] xl:text-[2.25rem]',
                )}
              >
                <span
                  className={cn(
                    'text-foreground block font-sans',
                    // Same structure as English: dark phrase line 1, gradient line 2.
                    isMyanmar && 'max-w-full whitespace-nowrap',
                  )}
                >
                  {translate('marketing.pages.home.hero.title.black')}
                </span>
                <span
                  // Keep `text-brand-gradient` outside twMerge — it conflicts with
                  // `text-transparent` (both look like text-color utilities) and gets dropped.
                  className={`text-brand-gradient ${cn(
                    // block + roomy leading keeps Myanmar diacritics visible with
                    // background-clip:text (see globals.css .text-brand-gradient).
                    'block max-w-full bg-clip-text font-sans text-transparent',
                    isMyanmar && 'leading-relaxed whitespace-nowrap',
                  )}`}
                >
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

            {/* Hero section description — stay inside the text column, never under the image */}
            <Body1 lang={language} className='max-w-full'>
              {translate('marketing.pages.home.hero.description')}
            </Body1>
          </div>

          {/* Primary and secondary CTAs */}
          <div className='flex min-w-0 flex-col gap-4 sm:flex-row'>
            <PrimaryButton
              className='w-full min-w-0 sm:w-auto'
              onClick={() => scrollToElement('our-programs-section')}
            >
              <Heart className='h-5 w-5' />
              <span>{translate('marketing.pages.home.hero.cta.primary')}</span>
              <ArrowRight className='h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
            </PrimaryButton>

            <SecondaryButton
              className='w-full min-w-0 sm:w-auto'
              onClick={() => router.push(ROUTES.MARKETING.ABOUT)}
            >
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
            priority
          />

          {/* Floating card: Personalized Plans */}
          <FloatingCard
            icon={<Heart className='h-5 w-5' />}
            title={translate(
              'marketing.pages.home.hero.floating-cards.personalized-plans.title',
            )}
            description={translate(
              'marketing.pages.home.hero.floating-cards.personalized-plans.description',
            )}
            className='-top-6 -left-2 sm:-left-4 lg:-top-4 lg:-left-6'
            iconClassName='bg-linear-to-r from-brand to-brand-light'
          />

          {/* Floating card: Doctor Guided */}
          <FloatingCard
            icon={<Shield className='h-5 w-5' />}
            title={translate(
              'marketing.pages.home.hero.floating-cards.doctor-guided.title',
            )}
            description={translate(
              'marketing.pages.home.hero.floating-cards.doctor-guided.description',
            )}
            className='-right-2 -bottom-6 sm:-right-4 lg:-right-6'
            iconClassName='bg-linear-to-r from-brand-light to-brand-deep'
          />
        </div>
      </div>
    </SectionContainer>
  );
};

export default HomeIntroSection;
