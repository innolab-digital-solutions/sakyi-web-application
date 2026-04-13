'use client';

import {
  CheckCircle,
  HandHeart,
  Heart,
  ListChecks,
  Puzzle,
  Star,
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
        'marketing.pages.programs.personalized-care.features.goal-oriented-approach.title',
      ),
      description: translate(
        'marketing.pages.programs.personalized-care.features.goal-oriented-approach.description',
      ),
    },
    {
      icon: <ListChecks className='h-5 w-5' />,
      title: translate(
        'marketing.pages.programs.personalized-care.features.lifestyle-integration.title',
      ),
      description: translate(
        'marketing.pages.programs.personalized-care.features.lifestyle-integration.description',
      ),
    },
    {
      icon: <HandHeart className='h-5 w-5' />,
      title: translate(
        'marketing.pages.programs.personalized-care.features.expert-guidance-team-support.title',
      ),
      description: translate(
        'marketing.pages.programs.personalized-care.features.expert-guidance-team-support.description',
      ),
    },
    {
      icon: <Puzzle className='h-5 w-5' />,
      title: translate(
        'marketing.pages.programs.personalized-care.features.holistic-integration.title',
      ),
      description: translate(
        'marketing.pages.programs.personalized-care.features.holistic-integration.description',
      ),
    },
  ];

  return (
    <SectionContainer id='our-approach-section' className='bg-slate-50'>
      <div className='grid min-w-0 items-center gap-12 lg:grid-cols-2 lg:gap-16'>
        {/* Left Column */}
        <div className='min-w-0 space-y-8' data-aos='fade-right'>
          <div className='space-y-6'>
            <SectionBadge
              icon={<Zap className='h-4 w-4' />}
              text={translate(
                'marketing.pages.programs.personalized-care.badge',
              )}
            />

            <Heading2 lang={language}>
              <span className='text-foreground block'>
                {translate(
                  'marketing.pages.programs.personalized-care.title.black',
                )}{' '}
                <span className='text-brand-gradient bg-clip-text text-transparent'>
                  {translate(
                    'marketing.pages.programs.personalized-care.title.gradient',
                  )}
                </span>
              </span>
            </Heading2>

            <Body1 lang={language} className='max-w-2xl'>
              {translate(
                'marketing.pages.programs.personalized-care.description',
              )}
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

          {/* Stats Row */}
          <div className='grid grid-cols-3 gap-4 border-t border-slate-200/60 pt-8'>
            <div className='group flex flex-col items-center gap-2 text-center'>
              <CheckCircle className='h-5 w-5 text-[#35bec5]' />
              <p
                className='text-sm font-medium text-slate-600 transition-colors duration-200 group-hover:text-slate-900'
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {translate(
                  'marketing.pages.programs.personalized-care.highlights.client-outcomes.title',
                )}
              </p>
            </div>

            <div className='group flex flex-col items-center gap-2 border-x border-slate-200/60 text-center'>
              <Heart className='h-5 w-5 text-[#35bec5]' />
              <p
                className='text-sm font-medium text-slate-600 transition-colors duration-200 group-hover:text-slate-900'
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {translate(
                  'marketing.pages.programs.personalized-care.highlights.community-trust.title',
                )}
              </p>
            </div>

            <div className='group flex flex-col items-center gap-2 text-center'>
              <Star className='h-5 w-5 text-[#35bec5]' />
              <p
                className='text-sm font-medium text-slate-600 transition-colors duration-200 group-hover:text-slate-900'
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {translate(
                  'marketing.pages.programs.personalized-care.highlights.positive-feedback.title',
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className='relative min-w-0' data-aos='fade-left'>
          <div className='relative'>
            <DecorativeImage
              src='/images/our-approach.jpg'
              alt='SaKyi Wellness Approach - Holistic Health Methodology'
              width={600}
              height={600}
            />

            <FloatingCard
              icon={<Target className='h-5 w-5' />}
              title={translate(
                'marketing.pages.programs.personalized-care.floating-cards.proven-results.title',
              )}
              description={translate(
                'marketing.pages.programs.personalized-care.floating-cards.proven-results.description',
              )}
              className='-top-6 -left-2 sm:-left-4 lg:-top-4 lg:-left-6'
              iconClassName='bg-gradient-to-r from-[#35bec5] to-[#4bc4db]'
            />

            <FloatingCard
              icon={<CheckCircle className='h-5 w-5' />}
              title={translate(
                'marketing.pages.programs.personalized-care.floating-cards.holistic-care.title',
              )}
              description={translate(
                'marketing.pages.programs.personalized-care.floating-cards.holistic-care.description',
              )}
              className='-right-2 -bottom-6 sm:-right-4 lg:-right-6'
              iconClassName='bg-gradient-to-r from-[#4bc4db] to-[#0c96c4]'
            />
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};

export default OurApproachSection;
