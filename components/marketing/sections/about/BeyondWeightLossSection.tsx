'use client';

import { Award, Heart, Scale, Users } from 'lucide-react';

import PrimaryCtaLink from '@/components/marketing/buttons/PrimaryCtaLink';
import SecondaryCtaLink from '@/components/marketing/buttons/SecondaryCtaLink';
import FeatureList from '@/components/marketing/FeatureList';
import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading2 from '@/components/shared/typography/Heading2';
import { ROUTES } from '@/config/routes';
import { useLanguage } from '@/context/LanguageContext';

const BeyondWeightLossSection = () => {
  const { language, translate } = useLanguage();

  const features = [
    {
      icon: <Scale className='h-5 w-5' />,
      title: translate(
        'marketing.pages.about.beyond-weight-loss.features.impact.title',
      ),
      description: translate(
        'marketing.pages.about.beyond-weight-loss.features.impact.description',
      ),
    },
    {
      icon: <Users className='h-5 w-5' />,
      title: translate(
        'marketing.pages.about.beyond-weight-loss.features.trust.title',
      ),
      description: translate(
        'marketing.pages.about.beyond-weight-loss.features.trust.description',
      ),
    },
    {
      icon: <Heart className='h-5 w-5' />,
      title: translate(
        'marketing.pages.about.beyond-weight-loss.features.sustainable-change.title',
      ),
      description: translate(
        'marketing.pages.about.beyond-weight-loss.features.sustainable-change.description',
      ),
    },
    {
      icon: <Award className='h-5 w-5' />,
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
      <div className='mx-auto max-w-3xl min-w-0 space-y-8'>
        <div className='space-y-6 text-center'>
          <SectionBadge
            icon={null}
            text={translate('marketing.pages.about.beyond-weight-loss.badge')}
          />

          <Heading2 lang={language} className='mx-auto text-center'>
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
            <Body1 lang={language} className='mx-auto max-w-2xl text-center'>
              {translate(
                'marketing.pages.about.beyond-weight-loss.description.paragraph-1',
              )}
            </Body1>
            <Body1 lang={language} className='mx-auto max-w-2xl text-center'>
              {translate(
                'marketing.pages.about.beyond-weight-loss.description.paragraph-2',
              )}
            </Body1>
            <Body1 lang={language} className='mx-auto max-w-2xl text-center'>
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

        <div className='flex flex-col items-stretch justify-center gap-4 pt-4 sm:flex-row sm:items-center sm:justify-center sm:gap-5'>
          <PrimaryCtaLink href={ROUTES.MARKETING.PROGRAMS}>
            <span>
              {translate('marketing.pages.about.call-to-action.cta.primary')}
            </span>
          </PrimaryCtaLink>
          <SecondaryCtaLink href={ROUTES.MARKETING.CONTACT}>
            <span>
              {translate('marketing.pages.about.call-to-action.cta.secondary')}
            </span>
          </SecondaryCtaLink>
        </div>
      </div>
    </SectionContainer>
  );
};

export default BeyondWeightLossSection;
