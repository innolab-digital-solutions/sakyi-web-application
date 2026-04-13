'use client';

import {
  Compass,
  Heart,
  Shield,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';

import FeatureList from '@/components/marketing/FeatureList';
import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading2 from '@/components/shared/typography/Heading2';
import { useLanguage } from '@/context/LanguageContext';

import FloatingCard from '../../cards/FloatingCard';
import DecorativeImage from '../../DecorativeImage';

const BeyondWeightLossSection = () => {
  const { language, translate } = useLanguage();

  const features = [
    {
      icon: <Heart className='h-5 w-5' />,
      title: translate(
        'marketing.pages.about.beyond-weight-loss.features.impact.title',
      ),
      description: translate(
        'marketing.pages.about.beyond-weight-loss.features.impact.description',
      ),
    },
    {
      icon: <Shield className='h-5 w-5' />,
      title: translate(
        'marketing.pages.about.beyond-weight-loss.features.trust.title',
      ),
      description: translate(
        'marketing.pages.about.beyond-weight-loss.features.trust.description',
      ),
    },
    {
      icon: <Users className='h-5 w-5' />,
      title: translate(
        'marketing.pages.about.beyond-weight-loss.features.sustainable-change.title',
      ),
      description: translate(
        'marketing.pages.about.beyond-weight-loss.features.sustainable-change.description',
      ),
    },
    {
      icon: <TrendingUp className='h-5 w-5' />,
      title: translate(
        'marketing.pages.about.beyond-weight-loss.features.people-centered-evidence-informed.title',
      ),
      description: translate(
        'marketing.pages.about.beyond-weight-loss.features.people-centered-evidence-informed.description',
      ),
    },
  ];

  return (
    <SectionContainer id='beyond-weight-loss-section' className='bg-background'>
      <div className='grid min-w-0 items-center gap-12 lg:grid-cols-2 lg:gap-16'>
        {/* Left: Decorative Image with Floating Cards */}
        <div className='relative min-w-0' data-aos='fade-right'>
          <div className='relative'>
            <DecorativeImage
              src='/images/our-impact.jpg'
              alt='SaKyi Mission & Philosophy - Holistic Wellness Approach'
              width={600}
              height={600}
            />

            <FloatingCard
              icon={<Target className='h-5 w-5' />}
              title={translate(
                'marketing.pages.about.beyond-weight-loss.floating-cards.proven-results.title',
              )}
              description={translate(
                'marketing.pages.about.beyond-weight-loss.floating-cards.proven-results.description',
              )}
              className='-top-6 -left-2 sm:-left-4 lg:-top-4 lg:-left-6'
              iconClassName='bg-linear-to-r from-[#35bec5] to-[#4bc4db]'
            />

            <FloatingCard
              icon={<Heart className='h-5 w-5' />}
              title={translate(
                'marketing.pages.about.beyond-weight-loss.floating-cards.holistic-care.title',
              )}
              description={translate(
                'marketing.pages.about.beyond-weight-loss.floating-cards.holistic-care.description',
              )}
              className='-right-2 -bottom-6 sm:-right-4 lg:-right-6'
              iconClassName='bg-linear-to-r from-[#4bc4db] to-[#0c96c4]'
            />
          </div>
        </div>

        {/* Right: Section Title, Description, and Feature List */}
        <div className='min-w-0 space-y-8' data-aos='fade-left'>
          <div className='space-y-6'>
            <SectionBadge
              icon={<Compass className='h-4 w-4' />}
              text={translate('marketing.pages.about.beyond-weight-loss.badge')}
            />
            <Heading2 lang={language}>
              <span className='text-foreground'>
                {translate(
                  'marketing.pages.about.beyond-weight-loss.title.black',
                )}{' '}
              </span>
              <span className='text-brand-gradient bg-clip-text text-transparent'>
                {translate(
                  'marketing.pages.about.beyond-weight-loss.title.gradient',
                )}
              </span>
            </Heading2>

            <div className='space-y-4 text-left'>
              <Body1 lang={language} className='mx-auto max-w-2xl'>
                {translate(
                  'marketing.pages.about.beyond-weight-loss.description.paragraph-1',
                )}
              </Body1>

              <Body1 lang={language} className='mx-auto max-w-2xl'>
                {translate(
                  'marketing.pages.about.beyond-weight-loss.description.paragraph-2',
                )}
              </Body1>

              <Body1 lang={language} className='mx-auto max-w-2xl'>
                {translate(
                  'marketing.pages.about.beyond-weight-loss.description.paragraph-3',
                )}
              </Body1>
            </div>
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

export default BeyondWeightLossSection;
