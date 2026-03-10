'use client';

import { MessageCircle } from 'lucide-react';

import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading2 from '@/components/shared/typography/Heading2';
import { useLanguage } from '@/context/LanguageContext';

const SendUsMessageSection = () => {
  const { language, translate } = useLanguage();

  return (
    <SectionContainer id='send-us-message-section' className='bg-background'>
      {/* Section Header: Badge, headline, supporting summary */}
      <div className='flex min-w-0 flex-col items-center justify-center space-y-6'>
        <SectionBadge
          icon={<MessageCircle className='h-4 w-4' />}
          text={translate('marketing.pages.contact.contact-form.badge')}
        />

        {/* Section Title with black and gradient parts */}
        <Heading2 lang={language} className='mx-auto text-center'>
          <span className='text-foreground'>
            {translate('marketing.pages.contact.contact-form.title.black')}{' '}
          </span>
          <span className='text-brand-gradient bg-clip-text text-transparent'>
            {translate('marketing.pages.contact.contact-form.title.gradient')}
          </span>
        </Heading2>

        {/* Supporting Description */}
        <Body1 lang={language} className='mx-auto max-w-2xl text-center'>
          {translate('marketing.pages.contact.contact-form.description')}
        </Body1>
      </div>
    </SectionContainer>
  );
};

export default SendUsMessageSection;
