'use client';

import {
  ArrowRight,
  ClipboardList,
  MessageCircle,
  Settings,
  Target,
} from 'lucide-react';
import Link from 'next/link';

import PrimaryButton from '@/components/marketing/buttons/PrimaryButton';
import HowItWorksStepCard from '@/components/marketing/cards/HowItWorksStepCard';
import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading2 from '@/components/shared/typography/Heading2';
import { ROUTES } from '@/config/routes';
import { useLanguage } from '@/context/LanguageContext';

const HowItWorksSection = () => {
  const { language, translate } = useLanguage();

  const steps = [
    {
      step: '01',
      title: translate(
        'marketing.pages.home.how-it-works.steps.initial-consultation.title',
      ),
      description: translate(
        'marketing.pages.home.how-it-works.steps.initial-consultation.description',
      ),
      icon: <MessageCircle className='h-7 w-7 text-white' />,
    },
    {
      step: '02',
      title: translate(
        'marketing.pages.home.how-it-works.steps.program-selection.title',
      ),
      description: translate(
        'marketing.pages.home.how-it-works.steps.program-selection.description',
      ),
      icon: <ClipboardList className='h-7 w-7 text-white' />,
    },
    {
      step: '03',
      title: translate(
        'marketing.pages.home.how-it-works.steps.review-results-and-start.title',
      ),
      description: translate(
        'marketing.pages.home.how-it-works.steps.review-results-and-start.description',
      ),
      icon: <Target className='h-7 w-7 text-white' />,
    },
  ];

  return (
    <SectionContainer id='how-it-works-section' className='bg-white'>
      {/* Section Header: Badge, headline, supporting summary */}
      <div
        className='flex min-w-0 flex-col items-center justify-center space-y-6'
        data-aos='fade-up'
      >
        <SectionBadge
          icon={<Settings className='h-4 w-4' />}
          text={translate('marketing.pages.home.how-it-works.badge')}
        />

        <Heading2 lang={language} className='mx-auto text-center'>
          <span className='text-foreground'>
            {translate('marketing.pages.home.how-it-works.title.black')}{' '}
          </span>
          <span className='text-brand-gradient bg-clip-text text-transparent'>
            {translate('marketing.pages.home.how-it-works.title.gradient')}
          </span>
        </Heading2>

        <Body1 lang={language} className='mx-auto max-w-2xl text-center'>
          {translate('marketing.pages.home.how-it-works.description')}
        </Body1>
      </div>

      {/* Steps Grid: Visual guide for the 3-step process */}
      <div className='mt-12 grid min-w-0 gap-6 lg:mt-16 lg:grid-cols-3 lg:gap-8'>
        {steps.map((step, index) => (
          <div key={index} data-aos='fade-up' data-aos-delay={`${index * 100}`}>
            <HowItWorksStepCard
              step={step.step}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          </div>
        ))}
      </div>

      {/* Section CTA: Prompt to start process */}
      <div className='mt-12 flex items-center justify-center'>
        <Link
          href={ROUTES.MARKETING.CONTACT}
          className='inline-block w-full min-w-0 sm:w-auto'
        >
          <PrimaryButton className='w-full min-w-0 sm:w-auto'>
            <span>
              {translate('marketing.pages.home.how-it-works.cta.primary')}
            </span>
            <ArrowRight className='h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
          </PrimaryButton>
        </Link>
      </div>
    </SectionContainer>
  );
};

export default HowItWorksSection;
