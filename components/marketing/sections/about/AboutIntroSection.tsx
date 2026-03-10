'use client';

import { Users } from 'lucide-react';

import SectionBadge from '@/components/site/shared/SectionBadge';
import SectionContainer from '@/components/site/shared/SectionContainer';
import SectionDescription from '@/components/site/shared/SectionDescription';
import SectionImageCard from '@/components/site/shared/SectionImageCard';
import SectionTitle from '@/components/site/shared/SectionTitle';
import { useLanguage } from '@/context/LanguageContext';

const AboutIntroSection = () => {
  const { language, translate } = useLanguage();

  return (
    <SectionContainer id='about-intro-section' className='bg-white'>
      <div className='grid min-w-0 items-center gap-12 lg:grid-cols-2 lg:gap-16'>
        {/* Left: Badge, Title, Description */}
        <div className='min-w-0 space-y-8'>
          <SectionBadge
            icon={<Users className='h-4 w-4' />}
            text={translate('marketing.pages.about.hero.badge')}
          />

          <div className='space-y-6'>
            {/* Section Title and description */}
            <SectionTitle
              as='h1'
              variant='hero'
              language={language}
              blackPart={translate('marketing.pages.about.hero.title.black')}
              gradientPart={translate(
                'marketing.pages.about.hero.title.gradient',
              )}
            />

            <SectionDescription language={language} maxWidth>
              {translate('marketing.pages.about.hero.description')}
            </SectionDescription>
          </div>
        </div>

        {/* Right: Image Cards Grid */}
        <div className='relative min-w-0'>
          <div className='grid grid-cols-2 gap-4'>
            {/* Main team image, large card */}
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
            {/* Additional small cards */}
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
