'use client';

import { ArrowRight, Heart, Settings } from 'lucide-react';
import Link from 'next/link';

import GradientButton from '@/components/site/shared/GradientButton';
import GradientText from '@/components/site/shared/GradientText';
import SectionBadge from '@/components/site/shared/SectionBadge';
import SectionContainer from '@/components/site/shared/SectionContainer';
import PATHS from '@/config/paths';
import { useLanguage } from '@/context/LanguageContext';

const HowItWorksSection = () => {
  const { translate } = useLanguage();

  return (
    <SectionContainer id='how-it-works-section' className='bg-background'>
      {/* Section Header: Badge, headline, supporting summary */}
      <div className='flex flex-col items-center justify-center space-y-6'>
        <SectionBadge
          icon={<Settings className='h-4 w-4' />}
          text={translate('site.home.how-it-works.badge')}
        />

        {/* Headline with gradient highlight for visual emphasis */}
        <h2
          className='flex items-center justify-center text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl'
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          <span className='text-foreground'>
            {translate('site.home.how-it-works.title.black')}
          </span>
          <GradientText>
            &nbsp;{translate('site.home.how-it-works.title.gradient')}
          </GradientText>
        </h2>

        {/* Brief section description */}
        <p
          className='text-foreground/80 mx-auto max-w-2xl text-center text-lg leading-relaxed'
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {translate('site.home.how-it-works.description')}
        </p>
      </div>

      {/* Steps Grid: Visual guide for the 3-step process */}
      <div className='mt-16 grid gap-8 lg:grid-cols-3'>
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
            className='group border-border relative overflow-hidden rounded-2xl border bg-white p-8 text-center shadow-sm transition-all duration-300 hover:border-[#35bec5]/50 hover:shadow-lg'
            data-aos='flip-up'
            data-aos-delay={`${index * 200 + 400}`}
            data-aos-duration='1000'
            data-aos-easing='ease-out-cubic'
          >
            {/* Step Illustration */}
            {step.illustration}

            {/* Step Content: Title and description */}
            <div className='space-y-4'>
              <h3
                className='text-foreground text-xl font-bold'
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {step.title}
              </h3>

              <p
                className='text-foreground/80'
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Section CTA: Prompt to start process */}
      <div className='mt-12 flex items-center justify-center'>
        <Link href={PATHS.SITE.CONTACT} className='inline-block'>
          <GradientButton>
            <span>{translate('site.home.how-it-works.cta.primary')}</span>
            <ArrowRight className='h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
          </GradientButton>
        </Link>
      </div>
    </SectionContainer>
  );
};

export default HowItWorksSection;
