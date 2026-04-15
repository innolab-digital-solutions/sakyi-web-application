'use client';

import { FileQuestion } from 'lucide-react';

type ContentEmptyStateProps = {
  title: string;
  description: string;
  className?: string;
};

const ContentEmptyState = ({
  title,
  description,
  className = '',
}: ContentEmptyStateProps) => {
  return (
    <div
      className={`rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 p-12 text-center ${className}`.trim()}
    >
      <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-r from-[#35bec5] to-[#0c96c4] text-white'>
        <FileQuestion className='h-8 w-8' />
      </div>
      <h3
        className='mb-4 text-2xl font-bold text-slate-900'
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        {title}
      </h3>
      <p
        className='mx-auto max-w-2xl text-base text-slate-600'
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {description}
      </p>
    </div>
  );
};

export default ContentEmptyState;
