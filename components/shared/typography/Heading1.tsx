'use client';

import type { PropsWithChildren } from 'react';

import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/config/languages';
import { cn } from '@/lib/utils/styles';

type Heading1Props = PropsWithChildren<{
  lang?: SupportedLanguage;
  className?: string;
}>;

/**
 * Heading1 is a presentational component that renders its children within an <h1> tag,
 * applying prominent display styles based on the specified language.
 *
 * - For Burmese ('my'), uses larger font sizes and relaxed line height for optimal legibility.
 * - For all other SupportedLanguage values, applies even more prominent sizing and tighter heading tracking for impact.
 *
 * @param {Heading1Props} props
 * @param {SupportedLanguage} [props.lang=DEFAULT_LANGUAGE] - The language to determine typographic styles.
 * @param {string} [props.className] - Optional additional class names for the heading.
 * @param {React.ReactNode} props.children - The heading content displayed inside the <h1>.
 *
 * @returns {JSX.Element} A styled <h1> element for main page headings.
 */
const Heading1 = ({
  lang = DEFAULT_LANGUAGE,
  className,
  children,
}: Heading1Props) => {
  return (
    <h1
      className={cn(
        'text-foreground min-w-0 wrap-break-word',
        lang === 'my'
          ? 'font-sans text-3xl leading-relaxed font-bold sm:text-4xl lg:text-5xl'
          : 'font-sans text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl',
        className,
      )}
    >
      {children}
    </h1>
  );
};

export default Heading1;
