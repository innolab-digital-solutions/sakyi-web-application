'use client';

import {
  CheckCircle,
  FlaskConical,
  HandHeart,
  Heart,
  Infinity,
  Shield,
  TrendingUp,
} from 'lucide-react';

import FeatureCard from '@/components/marketing/cards/ProgramWhyChooseCard';
import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading2 from '@/components/shared/typography/Heading2';
import { useLanguage } from '@/context/LanguageContext';

const WhyChooseSaKyiSection = () => {
  const { language, translate } = useLanguage();

  const features = [
    {
      icon: Shield,
      title: translate(
        'marketing.pages.programs.why-choose-sakyi.features.medical-expertise.title',
      ),
      description: translate(
        'marketing.pages.programs.why-choose-sakyi.features.medical-expertise.description',
      ),
      color: 'from-brand to-brand-light',
    },
    {
      icon: Heart,
      title: translate(
        'marketing.pages.programs.why-choose-sakyi.features.personalized-approach.title',
      ),
      description: translate(
        'marketing.pages.programs.why-choose-sakyi.features.personalized-approach.description',
      ),
      color: 'from-brand-light to-brand-deep',
    },
    {
      icon: TrendingUp,
      title: translate(
        'marketing.pages.programs.why-choose-sakyi.features.trusted-outcomes.title',
      ),
      description: translate(
        'marketing.pages.programs.why-choose-sakyi.features.trusted-outcomes.description',
      ),
      color: 'from-brand to-brand-deep',
    },
    {
      icon: FlaskConical,
      title: translate(
        'marketing.pages.programs.why-choose-sakyi.features.science-based-methods.title',
      ),
      description: translate(
        'marketing.pages.programs.why-choose-sakyi.features.science-based-methods.description',
      ),
      color: 'from-brand-light to-brand',
    },
    {
      icon: HandHeart,
      title: translate(
        'marketing.pages.programs.why-choose-sakyi.features.comprehensive-support.title',
      ),
      description: translate(
        'marketing.pages.programs.why-choose-sakyi.features.comprehensive-support.description',
      ),
      color: 'from-brand-light to-brand',
    },
    {
      icon: Infinity,
      title: translate(
        'marketing.pages.programs.why-choose-sakyi.features.lifetime-access.title',
      ),
      description: translate(
        'marketing.pages.programs.why-choose-sakyi.features.lifetime-access.description',
      ),
      color: 'from-brand-light to-brand-deep',
    },
  ];
  return (
    <SectionContainer id='why-choose-sakyi-section' className='bg-white'>
      <div
        className='flex min-w-0 flex-col items-center justify-center space-y-6 text-center'
        data-aos='fade-up'
      >
        <SectionBadge
          icon={<CheckCircle className='h-4 w-4' />}
          text={translate('marketing.pages.programs.why-choose-sakyi.badge')}
        />

        <Heading2 lang={language} className='mx-auto text-center'>
          <span className='text-foreground'>
            {translate(
              'marketing.pages.programs.why-choose-sakyi.title.black',
            )}{' '}
          </span>
          <span className='text-brand-gradient bg-clip-text text-transparent'>
            {translate(
              'marketing.pages.programs.why-choose-sakyi.title.gradient',
            )}
          </span>
        </Heading2>

        <Body1
          lang={language}
          className='mx-auto max-w-3xl text-center text-slate-600'
        >
          {translate('marketing.pages.programs.why-choose-sakyi.description')}
        </Body1>
      </div>

      {/* Benefits Grid */}
      <div className='mt-12 grid gap-8 lg:grid-cols-3'>
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            color={feature.color}
            index={index}
          />
        ))}
      </div>
    </SectionContainer>
  );
};

export default WhyChooseSaKyiSection;
