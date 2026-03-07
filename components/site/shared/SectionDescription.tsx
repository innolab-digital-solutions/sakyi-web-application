'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/styles';

type SupportedLanguage = 'en' | 'my';

type SectionDescriptionProps = {
  children: ReactNode;
  /** For EN/MY body typography (line-height and size) */
  language: SupportedLanguage;
  /** Center the paragraph (e.g. How It Works, Our Programs) */
  center?: boolean;
  /** Apply max-w-2xl for readable line length */
  maxWidth?: boolean;
  className?: string;
};

/**
 * Reusable section body/description paragraph. Use after SectionBadge + SectionTitle
 * so body typography is consistent across all site sections.
 */
const SectionDescription = ({
  children,
  language,
  center = false,
  maxWidth = true,
  className,
}: SectionDescriptionProps) => {
  const isMyanmar = language === 'my';

  const classes = isMyanmar
    ? 'text-foreground/80 font-sans text-base leading-loose sm:text-lg'
    : 'text-foreground/80 font-sans text-lg leading-relaxed';

  return (
    <p
      className={cn(
        classes,
        'min-w-0 max-w-full wrap-break-word',
        center && 'mx-auto text-center',
        maxWidth && 'max-w-2xl',
        className,
      )}
    >
      {children}
    </p>
  );
};

export default SectionDescription;
