'use client';

import { ChevronDown } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

type FAQCardProps = {
  question: string;
  answer: string;
  delayMs?: number;
};

const FAQCard = ({ question, answer, delayMs = 0 }: FAQCardProps) => {
  return (
    <Collapsible className='group'>
      <div
        className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md'
        data-aos='fade-up'
        data-aos-delay={`${delayMs}`}
      >
        <CollapsibleTrigger className='flex w-full items-center justify-between bg-slate-50 p-6 text-left transition-colors duration-300'>
          <h3
            className='text-lg font-semibold text-slate-900 transition-colors duration-300 group-hover:text-[#35bec5]'
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {question}
          </h3>
          <ChevronDown className='h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 group-data-[state=open]:rotate-180' />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className='px-6 py-6'>
            <p
              className='leading-relaxed text-slate-600'
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {answer}
            </p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default FAQCard;
