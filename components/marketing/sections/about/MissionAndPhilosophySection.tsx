'use client';

import { Compass, Heart, Lightbulb, Target } from 'lucide-react';

import DecorativeImage from '@/components/marketing/DecorativeImage';
import FeatureList from '@/components/marketing/FeatureList';
import FloatingCard from '@/components/marketing/cards/FloatingCard';
import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading2 from '@/components/shared/typography/Heading2';
import { useLanguage } from '@/context/LanguageContext';

const MissionAndPhilosophySection = () => {
  const { language, translate } = useLanguage();

  const features = [
    {
      icon: <Target className='h-5 w-5' />,
      title: translate(
        'marketing.pages.about.our-mission.features.mission.title',
      ),
      description: translate(
        'marketing.pages.about.our-mission.features.mission.description',
      ),
    },
    {
      icon: <Heart className='h-5 w-5' />,
      title: translate(
        'marketing.pages.about.our-mission.features.vision.title',
      ),
      description: translate(
        'marketing.pages.about.our-mission.features.vision.description',
      ),
    },
    {
      icon: <Lightbulb className='h-5 w-5' />,
      title: translate(
        'marketing.pages.about.our-mission.features.philosophy.title',
      ),
      description: translate(
        'marketing.pages.about.our-mission.features.philosophy.description',
      ),
    },
  ];

  return (
    <SectionContainer id='mission-and-philosophy-section' className='bg-background'>
      <div className='grid min-w-0 items-center gap-12 lg:grid-cols-2 lg:gap-16'>
        {/* Left: Decorative Image with Floating Cards */}
        <div className='relative min-w-0'>
          <div className='relative'>
            <DecorativeImage
              src='/images/about-mission.jpg'
              alt='SaKyi Mission & Philosophy - Holistic Wellness Approach'
              width={600}
              height={600}
            />

            <FloatingCard
              icon={<Target className='h-5 w-5' />}
              title={translate(
                'marketing.pages.about.our-mission.floating-cards.mission.title',
              )}
              description={translate(
                'marketing.pages.about.our-mission.floating-cards.mission.description',
              )}
              className='-top-6 -left-2 sm:-left-4 lg:-top-4 lg:-left-6'
              iconClassName='bg-linear-to-r from-[#35bec5] to-[#4bc4db]'
            />

            <FloatingCard
              icon={<Heart className='h-5 w-5' />}
              title={translate(
                'marketing.pages.about.our-mission.floating-cards.holistic.title',
              )}
              description={translate(
                'marketing.pages.about.our-mission.floating-cards.holistic.description',
              )}
              className='-right-2 -bottom-6 sm:-right-4 lg:-right-6'
              iconClassName='bg-linear-to-r from-[#4bc4db] to-[#0c96c4]'
            />
          </div>
        </div>

        {/* Right: Section Title, Description, and Feature List */}
        <div className='min-w-0 space-y-8'>
          <div className='space-y-6'>
            <SectionBadge
              icon={<Compass className='h-4 w-4' />}
              text={translate('marketing.pages.about.our-mission.badge')}
            />

            <Heading2 lang={language}>
              <span className='text-foreground'>
                {translate('marketing.pages.about.our-mission.title.black')}{' '}
              </span>
              <span className='text-brand-gradient bg-clip-text text-transparent'>
                {translate('marketing.pages.about.our-mission.title.gradient')}
              </span>
            </Heading2>

            <Body1 lang={language} className='max-w-2xl'>
              {translate('marketing.pages.about.our-mission.description')}
            </Body1>
          </div>

          <div className='space-y-4'>
            {features.map((feature, index) => (
              <FeatureList
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};

export default MissionAndPhilosophySection;
