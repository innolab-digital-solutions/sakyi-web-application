'use client';

import { ArrowRight, Heart, Settings } from 'lucide-react';
import Link from 'next/link';

import GradientButton from '@/components/site/shared/GradientButton';
import SectionBadge from '@/components/site/shared/SectionBadge';
import SectionCardDescription from '@/components/site/shared/SectionCardDescription';
import SectionCardTitle from '@/components/site/shared/SectionCardTitle';
import SectionContainer from '@/components/site/shared/SectionContainer';
import SectionDescription from '@/components/site/shared/SectionDescription';
import SectionTitle from '@/components/site/shared/SectionTitle';
import PATHS from '@/config/paths';
import { useLanguage } from '@/context/LanguageContext';

const HowItWorksSection = () => {
  const { language, translate } = useLanguage();

  return (
    <SectionContainer id='how-it-works-section' className='bg-background'>
      {/* Section Header: Badge, headline, supporting summary */}
      <div className='flex min-w-0 flex-col items-center justify-center space-y-6'>
        <SectionBadge
          icon={<Settings className='h-4 w-4' />}
          text={translate('site.home.how-it-works.badge')}
        />

        <SectionTitle
          as='h2'
          variant='section'
          language={language}
          blackPart={translate('site.home.how-it-works.title.black')}
          gradientPart={translate('site.home.how-it-works.title.gradient')}
          center
        />

        <SectionDescription language={language} center maxWidth>
          {translate('site.home.how-it-works.description')}
        </SectionDescription>
      </div>

      {/* Steps Grid: Visual guide for the 3-step process */}
      <div className='mt-12 grid min-w-0 gap-6 lg:mt-16 lg:grid-cols-3 lg:gap-8'>
        {[
          {
            step: '01',
            title: translate(
              'site.home.how-it-works.steps.initial-consultation.title',
            ),
            description: translate(
              'site.home.how-it-works.steps.initial-consultation.description',
            ),
            color: 'from-[#35bec5] to-[#4bc4db]',
            illustration: (
              <div className='relative mb-6'>
                {/* Icon inside colored container */}
                <div className='mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-linear-to-br from-[#35bec5]/10 to-[#4bc4db]/10 transition-all duration-500 group-hover:scale-105 group-hover:shadow-lg'>
                  <Heart className='h-12 w-12 text-[#35bec5] transition-transform duration-500 group-hover:scale-110' />
                </div>
                {/* Floating step number badge, top-right */}
                <div className='absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-r from-[#35bec5] to-[#4bc4db] text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl'>
                  <span className='text-sm font-bold'>01</span>
                </div>
              </div>
            ),
          },
          {
            step: '02',
            title: translate(
              'site.home.how-it-works.steps.program-selection.title',
            ),
            description: translate(
              'site.home.how-it-works.steps.program-selection.description',
            ),
            color: 'from-[#4bc4db] to-[#0c96c4]',
            illustration: (
              <div className='relative mb-6'>
                {/* Icon with nested white dot in colored background */}
                <div className='mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-linear-to-br from-[#4bc4db]/10 to-[#0c96c4]/10 transition-all duration-500 group-hover:scale-105 group-hover:shadow-lg'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-r from-[#4bc4db] to-[#0c96c4] transition-transform duration-500 group-hover:scale-110'>
                    <div className='h-6 w-6 rounded-full bg-white transition-transform duration-500 group-hover:scale-110'></div>
                  </div>
                </div>
                {/* Floating step number badge, top-right */}
                <div className='absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-r from-[#4bc4db] to-[#0c96c4] text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl'>
                  <span className='text-sm font-bold'>02</span>
                </div>
              </div>
            ),
          },
          {
            step: '03',
            title: translate(
              'site.home.how-it-works.steps.review-results-and-start.title',
            ),
            description: translate(
              'site.home.how-it-works.steps.review-results-and-start.description',
            ),
            color: 'from-[#0c96c4] to-[#35bec5]',
            illustration: (
              <div className='relative mb-6'>
                {/* Icon composed of three white dots for progress/analysis */}
                <div className='mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-linear-to-br from-[#0c96c4]/10 to-[#35bec5]/10 transition-all duration-500 group-hover:scale-105 group-hover:shadow-lg'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-r from-[#0c96c4] to-[#35bec5] transition-transform duration-500 group-hover:scale-110'>
                    <div className='flex space-x-1'>
                      <div className='h-2 w-2 rounded-full bg-white transition-transform duration-500 group-hover:scale-110'></div>
                      <div className='h-2 w-2 rounded-full bg-white transition-transform duration-500 group-hover:scale-110'></div>
                      <div className='h-2 w-2 rounded-full bg-white transition-transform duration-500 group-hover:scale-110'></div>
                    </div>
                  </div>
                </div>
                {/* Floating step number badge, top-right */}
                <div className='absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-r from-[#0c96c4] to-[#35bec5] text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl'>
                  <span className='text-sm font-bold'>03</span>
                </div>
              </div>
            ),
          },
        ].map((step, index) => (
          <div
            key={index}
            className='group border-border relative min-w-0 overflow-hidden rounded-2xl border bg-white p-6 text-center shadow-sm transition-all duration-300 hover:border-[#35bec5]/50 hover:shadow-lg sm:p-8'
            data-aos='flip-up'
            data-aos-delay={`${index * 200 + 400}`}
            data-aos-duration='1000'
            data-aos-easing='ease-out-cubic'
          >
            {/* Step Illustration */}
            {step.illustration}

            {/* Step Content: Title and description – roomy line-height to avoid Myanmar glyph clip */}
            <div className='space-y-4'>
              <SectionCardTitle className='text-lg font-bold sm:text-xl'>
                {step.title}
              </SectionCardTitle>

              <SectionCardDescription language={language}>
                {step.description}
              </SectionCardDescription>
            </div>
          </div>
        ))}
      </div>

      {/* Section CTA: Prompt to start process */}
      <div className='mt-12 flex items-center justify-center'>
        <Link href={PATHS.SITE.CONTACT} className='inline-block w-full min-w-0 sm:w-auto'>
          <GradientButton className='w-full min-w-0 sm:w-auto'>
            <span>{translate('site.home.how-it-works.cta.primary')}</span>
            <ArrowRight className='h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
          </GradientButton>
        </Link>
      </div>
    </SectionContainer>
  );
};

export default HowItWorksSection;
