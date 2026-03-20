'use client';

import {
  LayoutDashboard,
  MessageSquare,
  Rocket,
  ScanLine,
  Settings,
} from 'lucide-react';

import HowItWorksStepCard from '@/components/marketing/cards/HowItWorksStepCard';
import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading1 from '@/components/shared/typography/Heading1';
import { useLanguage } from '@/context/LanguageContext';

const HowItWorks = () => {
  const { language, translate } = useLanguage();

  const steps = [
    {
      number: '01',
      title: translate(
        'marketing.pages.programs.how-it-works.steps.initial-consultation.title',
      ),
      description: translate(
        'marketing.pages.programs.how-it-works.steps.initial-consultation.description',
      ),
      icon: MessageSquare,
      color: 'from-[#35bec5] to-[#4bc4db]',
    },
    {
      number: '02',
      title: translate(
        'marketing.pages.programs.how-it-works.steps.health-and-body-assessment.title',
      ),
      description: translate(
        'marketing.pages.programs.how-it-works.steps.health-and-body-assessment.description',
      ),
      icon: ScanLine,
      color: 'from-[#4bc4db] to-[#0c96c4]',
    },
    {
      number: '03',
      title: translate(
        'marketing.pages.programs.how-it-works.steps.smart-tracking-program-design.title',
      ),
      description: translate(
        'marketing.pages.programs.how-it-works.steps.smart-tracking-program-design.description',
      ),
      icon: LayoutDashboard,
      color: 'from-[#35bec5] to-[#0c96c4]',
    },
    {
      number: '04',
      title: translate(
        'marketing.pages.programs.how-it-works.steps.program-launch-support.title',
      ),
      description: translate(
        'marketing.pages.programs.how-it-works.steps.program-launch-support.description',
      ),
      icon: Rocket,
      color: 'from-[#4bc4db] to-[#35bec5]',
    },
  ];

  return (
    <SectionContainer id='program-process-section' className='bg-background'>
      <div className='flex min-w-0 flex-col items-center justify-center space-y-6 text-center'>
        <SectionBadge
          icon={<Settings className='h-4 w-4' />}
          text={translate('marketing.pages.programs.how-it-works.badge')}
        />

        <Heading1 lang={language} className='mx-auto text-center'>
          <span className='text-foreground'>
            {translate(
              'marketing.pages.programs.how-it-works.title.black',
            )}{' '}
          </span>
          <span className='text-brand-gradient bg-clip-text text-transparent'>
            {translate('marketing.pages.programs.how-it-works.title.gradient')}
          </span>
        </Heading1>

        <Body1
          lang={language}
          className='mx-auto max-w-3xl text-center text-slate-600'
        >
          {translate('marketing.pages.programs.how-it-works.description')}
        </Body1>
      </div>

      <div className='mt-12 grid gap-8 lg:grid-cols-2'>
        {steps.map((step) => (
          <HowItWorksStepCard
            key={step.number}
            step={step.number}
            title={step.title}
            description={step.description}
            icon={<step.icon className='h-7 w-7 text-white' />}
          />
        ))}
      </div>
    </SectionContainer>
  );
};

export default HowItWorks;
