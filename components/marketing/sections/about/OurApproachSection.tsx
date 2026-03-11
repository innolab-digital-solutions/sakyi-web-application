'use client';

import {
  CheckCircle,
  HandHeart,
  ListChecks,
  Puzzle,
  Stethoscope,
  Target,
  Zap,
} from 'lucide-react';

import FloatingCard from '@/components/marketing/cards/FloatingCard';
import DecorativeImage from '@/components/marketing/DecorativeImage';
import FeatureList from '@/components/marketing/FeatureList';
import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading2 from '@/components/shared/typography/Heading2';
import { useLanguage } from '@/context/LanguageContext';

const OurApproachSection = () => {
  const { language, translate } = useLanguage();

  const features = [
    {
      icon: <Stethoscope className='h-5 w-5' />,
      title: translate(
        'marketing.pages.about.our-approach.features.evaluation.title',
      ),
      description: translate(
        'marketing.pages.about.our-approach.features.evaluation.description',
      ),
    },
    {
      icon: <ListChecks className='h-5 w-5' />,
      title: translate(
        'marketing.pages.about.our-approach.features.tailored-planning.title',
      ),
      description: translate(
        'marketing.pages.about.our-approach.features.tailored-planning.description',
      ),
    },
    {
      icon: <HandHeart className='h-5 w-5' />,
      title: translate(
        'marketing.pages.about.our-approach.features.professional-support.title',
      ),
      description: translate(
        'marketing.pages.about.our-approach.features.professional-support.description',
      ),
    },
    {
      icon: <Puzzle className='h-5 w-5' />,
      title: translate(
        'marketing.pages.about.our-approach.features.holistic-integration.title',
      ),
      description: translate(
        'marketing.pages.about.our-approach.features.holistic-integration.description',
      ),
    },
  ];

  return (
    <SectionContainer id='our-approach-section' className='bg-white'>
      <div className='grid min-w-0 items-center gap-12 lg:grid-cols-2 lg:gap-16'>
        <div className='min-w-0 space-y-8'>
          <div className='space-y-6'>
            <SectionBadge
              icon={<Zap className='h-4 w-4' />}
              text={translate('marketing.pages.about.our-approach.badge')}
            />

            <Heading2 lang={language}>
              <span className='text-foreground'>
                {translate(
                  'marketing.pages.about.our-approach.title.black',
                )}{' '}
              </span>
              <span className='text-brand-gradient bg-clip-text text-transparent'>
                {translate(
                  'marketing.pages.about.our-approach.title.gradient',
                )}
              </span>
            </Heading2>

            <Body1 lang={language} className='max-w-2xl'>
              {translate('marketing.pages.about.our-approach.description')}
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

        <div className='relative min-w-0'>
          <div className='relative'>
            <DecorativeImage
              src='/images/about/our-approach.jpg'
              alt='SaKyi Wellness Approach - Holistic Health Methodology'
              width={600}
              height={600}
            />

            <FloatingCard
              icon={<Target className='h-5 w-5' />}
              title={translate(
                'marketing.pages.about.our-approach.floating-cards.proven-results.title',
              )}
              description={translate(
                'marketing.pages.about.our-approach.floating-cards.proven-results.description',
              )}
              className='-top-6 -left-2 sm:-left-4 lg:-top-4 lg:-left-6'
              iconClassName='bg-linear-to-r from-[#35bec5] to-[#4bc4db]'
            />

            <FloatingCard
              icon={<CheckCircle className='h-5 w-5' />}
              title={translate(
                'marketing.pages.about.our-approach.floating-cards.holistic-care.title',
              )}
              description={translate(
                'marketing.pages.about.our-approach.floating-cards.holistic-care.description',
              )}
              className='-right-2 -bottom-6 sm:-right-4 lg:-right-6'
              iconClassName='bg-linear-to-r from-[#4bc4db] to-[#0c96c4]'
            />
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};

export default OurApproachSection;
