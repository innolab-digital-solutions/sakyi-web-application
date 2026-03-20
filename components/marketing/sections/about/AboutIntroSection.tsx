'use client';

import { Users } from 'lucide-react';

import SectionImageCard from '@/components/marketing/cards/SectionImageCard';
import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading1 from '@/components/shared/typography/Heading1';
import { useLanguage } from '@/context/LanguageContext';

const AboutIntroSection = () => {
  const { language, translate } = useLanguage();

  return (
    <SectionContainer id='about-intro-section' className='bg-background'>
      <div className='grid min-w-0 items-center gap-12 lg:grid-cols-2 lg:gap-16'>
        {/* Left: Badge, Title, Description */}
        <div className='min-w-0 space-y-6'>
          <SectionBadge
            icon={<Users className='h-4 w-4' />}
            text={translate('marketing.pages.about.hero.badge')}
          />

          <div className='space-y-4'>
            <Heading1 lang={language}>
              <span className='text-foreground block font-sans'>
                {translate('marketing.pages.about.hero.title.black')}{' '}
                <span className='text-brand-gradient bg-clip-text font-sans text-transparent'>
                  {translate('marketing.pages.about.hero.title.gradient')}
                </span>
              </span>
            </Heading1>

            <Body1 lang={language} className='max-w-2xl'>
              {translate('marketing.pages.about.hero.description')}
            </Body1>
          </div>
        </div>

        {/* Right: Image Cards Grid */}
        <div className='relative min-w-0'>
          <div className='grid grid-cols-2 gap-4'>
            <SectionImageCard
              src='/images/about-hero-2.jpg'
              alt='SaKyi Wellness Team - Holistic Health Approach'
              title={translate(
                'marketing.pages.about.hero.images.expert-team.title',
              )}
              subtitle={translate(
                'marketing.pages.about.hero.images.expert-team.subtitle',
              )}
              variant='large'
              className='col-span-2 row-span-2'
              priority
            />
            <SectionImageCard
              src='/images/about-hero-1.jpg'
              alt='Wellness Consultation - Personalized Care'
              title={translate(
                'marketing.pages.about.hero.images.personalized-care.title',
              )}
              subtitle={translate(
                'marketing.pages.about.hero.images.personalized-care.subtitle',
              )}
              variant='small'
            />
            <SectionImageCard
              src='/images/about-hero-3.jpg'
              alt='Holistic Wellness Approach - Mind, Body, Spirit'
              title={translate(
                'marketing.pages.about.hero.images.holistic-approach.title',
              )}
              subtitle={translate(
                'marketing.pages.about.hero.images.holistic-approach.subtitle',
              )}
              variant='small'
            />
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};

export default AboutIntroSection;
