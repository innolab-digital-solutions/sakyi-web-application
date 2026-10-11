'use client';

import { ArrowRight, ChevronRight, Heart, Mail } from 'lucide-react';

import PrimaryCtaLink from '@/components/marketing/buttons/PrimaryCtaLink';
import SecondaryCtaLink from '@/components/marketing/buttons/SecondaryCtaLink';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body2 from '@/components/shared/typography/Body2';
import Heading2 from '@/components/shared/typography/Heading2';
import { ROUTES } from '@/config/routes';
import { useLanguage } from '@/context/LanguageContext';

type CallToActionSectionProps = {
  /** Section anchor, e.g. `home-cta-section`. */
  id: string;
  /**
   * Dictionary prefix holding `title`, `description`, and `cta.primary` /
   * `cta.secondary` — e.g. `marketing.pages.home.call-to-action`.
   */
  translationPrefix: string;
  /** Target for the primary CTA. */
  primaryHref?: string;
  /** Target for the secondary CTA. */
  secondaryHref?: string;
};

/**
 * Closing call-to-action banner shared by every marketing page. Each page
 * supplies its own anchor id and dictionary prefix so the copy stays
 * page-specific while the layout stays in one place.
 */
const CallToActionSection = ({
  id,
  translationPrefix,
  primaryHref = ROUTES.MARKETING.PROGRAMS,
  secondaryHref = ROUTES.MARKETING.CONTACT,
}: CallToActionSectionProps) => {
  const { language, translate } = useLanguage();

  return (
    <SectionContainer
      id={id}
      className='from-brand to-brand-deep bg-linear-to-br'
    >
      <div className='mb-10 space-y-6 text-center' data-aos='fade-up'>
        <Heading2 lang={language} className='text-white'>
          {translate(`${translationPrefix}.title`)}
        </Heading2>

        <Body2 lang={language} className='mx-auto max-w-2xl text-white'>
          {translate(`${translationPrefix}.description`)}
        </Body2>
      </div>

      <div
        className='flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-5'
        data-aos='fade-up'
        data-aos-delay='100'
      >
        <PrimaryCtaLink href={primaryHref}>
          <Heart className='mr-2 h-5 w-5' />
          <span className='relative z-10'>
            {translate(`${translationPrefix}.cta.primary`)}
          </span>
          <ArrowRight className='ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
        </PrimaryCtaLink>

        <SecondaryCtaLink href={secondaryHref}>
          <Mail className='mr-2 h-5 w-5' />
          <span>{translate(`${translationPrefix}.cta.secondary`)}</span>
          <ChevronRight className='ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
        </SecondaryCtaLink>
      </div>
    </SectionContainer>
  );
};

export default CallToActionSection;
