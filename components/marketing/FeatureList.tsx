'use client';

import type { ReactNode } from 'react';

import Body3 from '@/components/shared/typography/Body3';
import Heading6 from '@/components/shared/typography/Heading6';
import { useLanguage } from '@/context/LanguageContext';

type FeatureListProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

const FeatureList = ({ icon, title, description }: FeatureListProps) => {
  const { language } = useLanguage();

  return (
    <div className='group flex min-w-0 items-start space-x-3 rounded-lg p-3 transition-all duration-300'>
      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-r from-[#35bec5] to-[#0c96c4] text-white shadow-lg'>
        {icon}
      </div>
      <div className='min-w-0 flex-1'>
        <Heading6 lang={language} className='mb-1'>
          {title}
        </Heading6>
        <Body3 lang={language}>{description}</Body3>
      </div>
    </div>
  );
};

export default FeatureList;
