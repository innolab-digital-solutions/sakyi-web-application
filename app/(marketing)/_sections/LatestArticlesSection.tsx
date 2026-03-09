'use client';

import Link from 'next/link';

import GradientButton from '@/components/site/shared/GradientButton';
import SectionBadge from '@/components/site/shared/SectionBadge';
import SectionContainer from '@/components/site/shared/SectionContainer';
import SectionDescription from '@/components/site/shared/SectionDescription';
import SectionTitle from '@/components/site/shared/SectionTitle';
import PATHS from '@/config/paths';
import { useLanguage } from '@/context/LanguageContext';

const LatestArticlesSection = () => {
  const { language, translate } = useLanguage();

  return (
    <SectionContainer id='latest-articles-section' className='bg-background'>
      <div className='mx-auto max-w-3xl min-w-0 space-y-6 text-center'>
        <SectionBadge
          icon={null}
          text={translate('marketing.pages.home.latest-articles.badge')}
        />

        <SectionTitle
          as='h2'
          variant='section'
          language={language}
          blackPart={translate(
            'marketing.pages.home.latest-articles.title.black',
          )}
          gradientPart={translate(
            'marketing.pages.home.latest-articles.title.gradient',
          )}
          center
        />

        <SectionDescription language={language} center>
          {translate('marketing.pages.home.latest-articles.description')}
        </SectionDescription>

        <div className='pt-4'>
          <Link
            href={PATHS.SITE.BLOG}
            className='inline-block w-full min-w-0 sm:w-auto'
          >
            <GradientButton className='w-full min-w-0 sm:w-auto'>
              <span>
                {translate('marketing.pages.home.latest-articles.cta.primary')}
              </span>
            </GradientButton>
          </Link>
        </div>
      </div>
    </SectionContainer>
  );
};

export default LatestArticlesSection;
