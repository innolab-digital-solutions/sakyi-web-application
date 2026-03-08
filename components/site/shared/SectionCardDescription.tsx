'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/styles';

type SupportedLanguage = 'en' | 'my';

type SectionCardDescriptionProps = {
  children: ReactNode;
  /** Myanmar uses leading-loose to avoid glyph clipping */
  language?: SupportedLanguage;
  className?: string;
};

/**
 * Description typography for section cards (e.g. step cards, feature list items).
 * Keeps card/feature descriptions consistent and readable (no cut-off for Myanmar).
 */
const SectionCardDescription = ({
  children,
  language = 'en',
  className,
}: SectionCardDescriptionProps) => {
  const isMyanmar = language === 'my';

  const lineHeightClass = isMyanmar ? 'leading-loose' : 'leading-relaxed';

  return (
    <p
      className={cn(
        'text-foreground/80 max-w-full min-w-0 font-sans text-sm wrap-break-word sm:text-base',
        lineHeightClass,
        className,
      )}
    >
      {children}
    </p>
  );
};

export default SectionCardDescription;
