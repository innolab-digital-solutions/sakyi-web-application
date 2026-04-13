'use client';

import { HelpCircle } from 'lucide-react';

import FAQCard from '@/components/marketing/cards/FaqCard';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading2 from '@/components/shared/typography/Heading2';
import { useLanguage } from '@/context/LanguageContext';

import SectionBadge from '../../SectionBadge';

const FAQSection = () => {
  const { language, translate } = useLanguage();

  const FAQS = [
    {
      question: translate(
        'marketing.pages.programs.faq.questions.program-duration.question',
      ),
      answer: translate(
        'marketing.pages.programs.faq.questions.program-duration.answer',
      ),
    },
    {
      question: translate(
        'marketing.pages.programs.faq.questions.diet-flexibility.question',
      ),
      answer: translate(
        'marketing.pages.programs.faq.questions.diet-flexibility.answer',
      ),
    },
    {
      question: translate(
        'marketing.pages.programs.faq.questions.gym-requirement.question',
      ),
      answer: translate(
        'marketing.pages.programs.faq.questions.gym-requirement.answer',
      ),
    },
    {
      question: translate(
        'marketing.pages.programs.faq.questions.program-offerings.question',
      ),
      answer: translate(
        'marketing.pages.programs.faq.questions.program-offerings.answer',
      ),
    },
    {
      question: translate(
        'marketing.pages.programs.faq.questions.program-selection.question',
      ),
      answer: translate(
        'marketing.pages.programs.faq.questions.program-selection.answer',
      ),
    },
    {
      question: translate(
        'marketing.pages.programs.faq.questions.program-requirements.question',
      ),
      answer: translate(
        'marketing.pages.programs.faq.questions.program-requirements.answer',
      ),
    },
    {
      question: translate(
        'marketing.pages.programs.faq.questions.busy-schedule.question',
      ),
      answer: translate(
        'marketing.pages.programs.faq.questions.busy-schedule.answer',
      ),
    },
  ];

  return (
    <SectionContainer id='faq-section' className='bg-white'>
      {/* Background Elements */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute top-1/4 -right-32 h-64 w-64 rounded-full bg-linear-to-br from-[#35bec5]/5 to-[#0c96c4]/5 blur-3xl' />
        <div className='absolute bottom-1/4 -left-32 h-64 w-64 rounded-full bg-linear-to-br from-[#4bc4db]/5 to-[#35bec5]/5 blur-3xl' />
      </div>

      {/* Header */}
      <div
        className='flex min-w-0 flex-col items-center justify-center space-y-6 text-center'
        data-aos='fade-up'
      >
        <SectionBadge
          icon={<HelpCircle className='h-4 w-4' />}
          text={translate('marketing.pages.programs.faq.badge')}
        />

        <Heading2 lang={language} className='mx-auto text-center'>
          <span className='text-foreground'>
            {translate('marketing.pages.programs.faq.title.black')}{' '}
          </span>
          <span className='text-brand-gradient bg-clip-text text-transparent'>
            {translate('marketing.pages.programs.faq.title.gradient')}
          </span>
        </Heading2>

        <Body1
          lang={language}
          className='mx-auto max-w-2xl text-center text-slate-600'
        >
          {translate('marketing.pages.programs.faq.description')}
        </Body1>
      </div>

      {/* FAQ Items */}
      <div className='mx-auto mt-12 max-w-4xl space-y-4'>
        {FAQS.map((faq, index) => (
          <FAQCard
            key={index}
            question={faq.question}
            answer={faq.answer}
            delayMs={Math.min(index, 3) * 100}
          />
        ))}
      </div>
    </SectionContainer>
  );
};

export default FAQSection;
