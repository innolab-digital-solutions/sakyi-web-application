'use client';

import { Compass, Heart, Lightbulb, Target } from 'lucide-react';

import DecorativeImage from '@/components/site/shared/DecorativeImage';
import FeatureList from '@/components/site/shared/FeatureList';
import FloatingCard from '@/components/site/shared/FloatingCard';
import SectionBadge from '@/components/site/shared/SectionBadge';
import SectionContainer from '@/components/site/shared/SectionContainer';
import SectionDescription from '@/components/site/shared/SectionDescription';
import SectionTitle from '@/components/site/shared/SectionTitle';
import { useLanguage } from '@/context/LanguageContext';

const MissionAndPhilosophySection = () => {
  const { language, translate } = useLanguage();

  const features = [
    {
      icon: <Target className='h-5 w-5' />,
      title: translate('site.about.our-mission.features.mission.title'),
      description: translate(
        'site.about.our-mission.features.mission.description',
      ),
    },
    {
      icon: <Heart className='h-5 w-5' />,
      title: translate('site.about.our-mission.features.vision.title'),
      description: translate(
        'site.about.our-mission.features.vision.description',
      ),
    },
    {
      icon: <Lightbulb className='h-5 w-5' />,
      title: translate('site.about.our-mission.features.philosophy.title'),
      description: translate(
        'site.about.our-mission.features.philosophy.description',
      ),
    },
  ];

  return (
    <SectionContainer id='mission-and-philosophy-section' className='bg-white'>
      <div className='grid min-w-0 items-center gap-12 lg:grid-cols-2 lg:gap-16'>
        {/* Left Side: Decorative Image with Floating Cards */}
        <div className='relative min-w-0'>
          <div className='relative'>
            <DecorativeImage
              src='/images/about-mission.jpg'
              alt='SaKyi Mission & Philosophy - Holistic Wellness Approach'
              width={600}
              height={600}
            />

            {/* FloatingCard: Mission */}
            <FloatingCard
              icon={<Target className='h-5 w-5' />}
              title={translate(
                'site.about.our-mission.floating-cards.mission.title',
              )}
              description={translate(
                'site.about.our-mission.floating-cards.mission.description',
              )}
              className='-top-6 -left-2 sm:-left-4 lg:-top-4 lg:-left-6'
              iconClassName='bg-linear-to-r from-[#35bec5] to-[#4bc4db]'
            />

            {/* FloatingCard: Holistic Care */}
            <FloatingCard
              icon={<Heart className='h-5 w-5' />}
              title={translate(
                'site.about.our-mission.floating-cards.holistic.title',
              )}
              description={translate(
                'site.about.our-mission.floating-cards.holistic.description',
              )}
              className='-right-2 -bottom-6 sm:-right-4 lg:-right-6'
              iconClassName='bg-linear-to-r from-[#4bc4db] to-[#0c96c4]'
            />
          </div>
        </div>

        {/* Right Side: Section Title, Description, and Feature List */}
        <div className='min-w-0 space-y-8'>
          <div className='space-y-6'>
            <SectionBadge
              icon={<Compass className='h-4 w-4' />}
              text={translate('site.about.our-mission.badge')}
            />

            <SectionTitle
              as='h2'
              variant='section'
              language={language}
              blackPart={translate('site.about.our-mission.title.black')}
              gradientPart={translate('site.about.our-mission.title.gradient')}
              layout='inline'
            />

            <SectionDescription language={language} maxWidth>
              {translate('site.about.our-mission.description')}
            </SectionDescription>
          </div>

          {/* Feature Items (Mission, Vision, Philosophy) */}
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
