'use client';

import { ArrowRight, Shield, Target, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

import GradientButton from '@/components/marketing/buttons/GradientButton';
import FloatingCard from '@/components/marketing/cards/FloatingCard';
import DecorativeImage from '@/components/marketing/DecorativeImage';
import FeatureList from '@/components/marketing/FeatureList';
import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading2 from '@/components/shared/typography/Heading2';
import { ROUTES } from '@/config/routes';
import { useLanguage } from '@/context/LanguageContext';

const AboutOverviewSection = () => {
  const { language, translate } = useLanguage();

  const features = [
    {
      icon: <Shield className='h-5 w-5' />,
      title: translate(
        'marketing.pages.home.about-overview.features.doctor-designed-programs.title',
      ),
      description: translate(
        'marketing.pages.home.about-overview.features.doctor-designed-programs.description',
      ),
    },
    {
      icon: <Target className='h-5 w-5' />,
      title: translate(
        'marketing.pages.home.about-overview.features.personalized-approach.title',
      ),
      description: translate(
        'marketing.pages.home.about-overview.features.personalized-approach.description',
      ),
    },
    {
      icon: <TrendingUp className='h-5 w-5' />,
      title: translate(
        'marketing.pages.home.about-overview.features.continuous-support-reporting.title',
      ),
      description: translate(
        'marketing.pages.home.about-overview.features.continuous-support-reporting.description',
      ),
    },
  ];

  return (
    <SectionContainer id='about-section' className='bg-background'>
      <div className='grid min-w-0 items-center gap-12 lg:grid-cols-2 lg:gap-16'>
        {/* Left: Decorative image & floating cards */}
        <div className='relative min-w-0'>
          <div className='relative'>
            <DecorativeImage
              src='/images/home-about.jpg'
              alt='Woman doing yoga meditation for wellness and mental health'
              width={600}
              height={600}
            />

            {/* Floating card: lives transformed */}
            <FloatingCard
              icon={<Users className='h-5 w-5' />}
              title='10K+ Lives'
              description='Transformed'
              className='-top-6 -left-2 sm:-left-4 lg:-top-4 lg:-left-6'
              iconClassName='bg-linear-to-r from-[#35bec5] to-[#4bc4db]'
            />

            {/* Floating card: success rate */}
            <FloatingCard
              icon={<TrendingUp className='h-5 w-5' />}
              title='98% Success'
              description='Rate'
              className='-right-2 -bottom-6 sm:-right-4 lg:-right-6'
              iconClassName='bg-linear-to-r from-[#4bc4db] to-[#0c96c4]'
            />
          </div>
        </div>

        {/* Right: Textual content and features */}
        <div className='min-w-0 space-y-8'>
          <div className='space-y-6'>
            {/* Section badge */}
            <SectionBadge
              icon={<Users className='h-4 w-4' />}
              text={translate('marketing.pages.home.about-overview.badge')}
            />

            {/* Section title with gradient highlight */}
            <Heading2 lang={language}>
              <span className='text-foreground'>
                {translate('marketing.pages.home.about-overview.title.black')}{' '}
              </span>
              <span className='text-brand-gradient bg-clip-text text-transparent'>
                {translate('marketing.pages.home.about-overview.title.gradient')}
              </span>
            </Heading2>

            {/* Section description */}
            <Body1 lang={language} className='max-w-2xl'>
              {translate('marketing.pages.home.about-overview.description')}
            </Body1>
          </div>

          {/* Features list */}
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

          {/* Call to action: Programs page button */}
          <div className='pt-4'>
            <Link
              href={ROUTES.MARKETING.PROGRAMS}
              className='inline-block w-full min-w-0 sm:w-auto'
            >
              <GradientButton className='w-full min-w-0 sm:w-auto'>
                <span>
                  {translate('marketing.pages.home.about-overview.cta.primary')}
                </span>
                <ArrowRight className='h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
              </GradientButton>
            </Link>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};

export default AboutOverviewSection;
