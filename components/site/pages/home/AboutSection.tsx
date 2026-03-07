'use client';

import { ArrowRight, Shield, Target, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

import DecorativeImage from '@/components/site/shared/DecorativeImage';
import FeatureList from '@/components/site/shared/FeatureList';
import FloatingCard from '@/components/site/shared/FloatingCard';
import GradientButton from '@/components/site/shared/GradientButton';
import SectionBadge from '@/components/site/shared/SectionBadge';
import SectionContainer from '@/components/site/shared/SectionContainer';
import SectionDescription from '@/components/site/shared/SectionDescription';
import SectionTitle from '@/components/site/shared/SectionTitle';
import PATHS from '@/config/paths';
import { useLanguage } from '@/context/LanguageContext';

const AboutSection = () => {
  const { language, translate } = useLanguage();

  const features = [
    {
      icon: <Shield className='h-5 w-5' />,
      title: translate(
        'site.home.about-overview.features.doctor-designed-programs.title',
      ),
      description: translate(
        'site.home.about-overview.features.doctor-designed-programs.description',
      ),
    },
    {
      icon: <Target className='h-5 w-5' />,
      title: translate(
        'site.home.about-overview.features.personalized-approach.title',
      ),
      description: translate(
        'site.home.about-overview.features.personalized-approach.description',
      ),
    },
    {
      icon: <TrendingUp className='h-5 w-5' />,
      title: translate(
        'site.home.about-overview.features.continuous-support-reporting.title',
      ),
      description: translate(
        'site.home.about-overview.features.continuous-support-reporting.description',
      ),
    },
  ];

  return (
    <SectionContainer id='about-section' className='bg-background'>
      <div className='grid min-w-0 items-center gap-12 lg:grid-cols-2 lg:gap-16'>
        <div className='relative min-w-0'>
          <div className='relative'>
            <DecorativeImage
              src='/images/home-about.jpg'
              alt='Woman doing yoga meditation for wellness and mental health'
              width={600}
              height={600}
            />

            <FloatingCard
              icon={<Users className='h-5 w-5' />}
              title='10K+ Lives'
              description='Transformed'
              className='-top-6 -left-2 sm:-left-4 lg:-top-4 lg:-left-6'
              iconClassName='bg-linear-to-r from-[#35bec5] to-[#4bc4db]'
            />

            <FloatingCard
              icon={<TrendingUp className='h-5 w-5' />}
              title='98% Success'
              description='Rate'
              className='-right-2 -bottom-6 sm:-right-4 lg:-right-6'
              iconClassName='bg-linear-to-r from-[#4bc4db] to-[#0c96c4]'
            />
          </div>
        </div>

        <div className='min-w-0 space-y-8'>
          <div className='space-y-6'>
            <SectionBadge
              icon={<Users className='h-4 w-4' />}
              text={translate('site.home.about-overview.badge')}
            />

            <SectionTitle
              as='h2'
              variant='section'
              language={language}
              blackPart={translate('site.home.about-overview.title.black')}
              gradientPart={translate('site.home.about-overview.title.gradient')}
            />

            <SectionDescription language={language} maxWidth>
              {translate('site.home.about-overview.description')}
            </SectionDescription>
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

          <div className='pt-4'>
            <Link href={PATHS.SITE.PROGRAMS} className='inline-block w-full min-w-0 sm:w-auto'>
              <GradientButton className='w-full min-w-0 sm:w-auto'>
                <span>{translate('site.home.about-overview.cta.primary')}</span>
                <ArrowRight className='h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
              </GradientButton>
            </Link>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};

export default AboutSection;
