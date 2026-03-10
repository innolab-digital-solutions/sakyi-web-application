'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import PrimaryButton from '@/components/marketing/buttons/PrimaryButton';
import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading2 from '@/components/shared/typography/Heading2';
import { ROUTES } from '@/config/routes';
import { useLanguage } from '@/context/LanguageContext';

const LatestArticlesSection = () => {
  const { language, translate } = useLanguage();

  return (
    <SectionContainer id='latest-articles-section' className='bg-white'>
      <div className='mx-auto max-w-3xl min-w-0 space-y-6 text-center'>
        {/* Section badge for Latest Articles */}
        <SectionBadge
          icon={null}
          text={translate('marketing.pages.home.latest-articles.badge')}
        />

        {/* Section headline with gradient highlight */}
        <Heading2 lang={language} className='mx-auto text-center'>
          <span className='text-foreground'>
            {translate('marketing.pages.home.latest-articles.title.black')}{' '}
          </span>
          <span className='text-brand-gradient bg-clip-text text-transparent'>
            {translate('marketing.pages.home.latest-articles.title.gradient')}
          </span>
        </Heading2>

        {/* Section description */}
        <Body1 lang={language} className='mx-auto text-center'>
          {translate('marketing.pages.home.latest-articles.description')}
        </Body1>

        {/* Call to action: Go to blog page */}
        <div className='pt-4'>
          <Link
            href={ROUTES.MARKETING.BLOG}
            className='inline-block w-full min-w-0 sm:w-auto'
          >
            <PrimaryButton className='w-full min-w-0 sm:w-auto'>
              <span>
                {translate('marketing.pages.home.latest-articles.cta.primary')}
              </span>
              <ArrowRight className='h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
            </PrimaryButton>
          </Link>
        </div>
      </div>
    </SectionContainer>
  );
};

export default LatestArticlesSection;
