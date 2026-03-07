'use client';

import Link from 'next/link';

import GradientButton from '@/components/site/shared/GradientButton';
import GradientText from '@/components/site/shared/GradientText';
import SectionBadge from '@/components/site/shared/SectionBadge';
import SectionContainer from '@/components/site/shared/SectionContainer';
import PATHS from '@/config/paths';
import { useLanguage } from '@/context/LanguageContext';

const LatestArticlesSection = () => {
  const { language, translate } = useLanguage();
  const isMyanmar = language === 'my';

  return (
    <SectionContainer id='latest-articles-section' className='bg-background'>
      <div className='mx-auto max-w-3xl space-y-6 text-center'>
        <SectionBadge
          icon={null}
          text={translate('site.home.latest-articles.badge')}
        />

        <h2
          className={
            isMyanmar
              ? 'font-sans text-2xl leading-relaxed font-bold sm:text-3xl lg:text-4xl lg:leading-loose'
              : 'font-sans text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl'
          }
        >
          <span className='text-foreground block'>
            {translate('site.home.latest-articles.title.black')}
          </span>
          <GradientText>
            {translate('site.home.latest-articles.title.gradient')}
          </GradientText>
        </h2>

        <p
          className={
            isMyanmar
              ? 'text-foreground/80 font-sans text-base leading-loose sm:text-lg'
              : 'text-foreground/80 font-sans text-lg leading-relaxed'
          }
        >
          {translate('site.home.latest-articles.description')}
        </p>

        <div className='pt-4'>
          <Link href={PATHS.SITE.BLOG} className='inline-block'>
            <GradientButton>
              <span>{translate('site.home.latest-articles.cta.primary')}</span>
            </GradientButton>
          </Link>
        </div>
      </div>
    </SectionContainer>
  );
};

export default LatestArticlesSection;
