'use client';

import type { ReactNode } from 'react';

import Body3 from '@/components/shared/typography/Body3';
import Heading5 from '@/components/shared/typography/Heading5';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils/styles';

type HowItWorksStepCardProps = {
  step: string;
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
};

const HowItWorksStepCard = ({
  step,
  title,
  description,
  icon,
  className,
}: HowItWorksStepCardProps) => {
  const { language } = useLanguage();

  return (
    <div
      className={cn(
        'group border-border hover:border-brand/50 relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-white p-6 text-center shadow-sm transition-all duration-300 hover:shadow-lg sm:p-8',
        className,
      )}
    >
      <div className='from-brand to-brand-light absolute top-5 right-5 flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-r text-xs font-semibold text-white shadow-md'>
        {step}
      </div>

      <div className='mb-6 flex items-center justify-center'>
        <div className='flex h-24 w-24 items-center justify-center rounded-3xl bg-sky-50 shadow-sm transition-all duration-500 group-hover:shadow-lg'>
          <div className='from-brand-light to-brand-deep flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-r'>
            {icon}
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        <Heading5 lang={language} className='text-lg font-bold sm:text-xl'>
          {title}
        </Heading5>

        <Body3 lang={language}>{description}</Body3>
      </div>
    </div>
  );
};

export default HowItWorksStepCard;
