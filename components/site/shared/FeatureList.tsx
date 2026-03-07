'use client';

import { useLanguage } from '@/context/LanguageContext';

import SectionCardDescription from '@/components/site/shared/SectionCardDescription';
import SectionCardTitle from '@/components/site/shared/SectionCardTitle';

type FeatureListProps = {
  icon: React.ReactNode;
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
        <SectionCardTitle className='mb-1'>{title}</SectionCardTitle>
        <SectionCardDescription language={language}>
          {description}
        </SectionCardDescription>
      </div>
    </div>
  );
};

export default FeatureList;
