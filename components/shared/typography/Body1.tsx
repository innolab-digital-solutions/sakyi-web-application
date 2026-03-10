'use client';

import type { PropsWithChildren } from 'react';

import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/config/languages';
import { cn } from '@/lib/utils/styles';

type Body1Props = PropsWithChildren<{
  lang?: SupportedLanguage;
  className?: string;
}>;


/**
 * Body1 is a presentational component that renders its children within a <p> tag,
 * applying standardized body text styles based on the specified language.
 *
 * - For Burmese ('my'), uses a medium font size and looser line height for readability.
 * - For other languages, uses a larger font size with relaxed line height.
 *
 * @param {Body1Props} props
 * @param {SupportedLanguage} [props.lang=DEFAULT_LANGUAGE] - The language used to determine typographic styles.
 * @param {string} [props.className] - Optional additional class names for the paragraph.
 * @param {React.ReactNode} props.children - The content to display inside the paragraph.
 *
 * @returns {JSX.Element} A styled paragraph element.
 */
const Body1 = ({
  lang = DEFAULT_LANGUAGE,
  className,
  children,
}: Body1Props) => {
  return (
    <p
      className={cn(
        'max-w-full min-w-0 wrap-break-word',
        lang === 'my'
          ? 'text-foreground/80 font-sans text-base leading-loose sm:text-lg'
          : 'text-foreground/80 font-sans text-lg leading-relaxed',
        className,
      )}
    >
      {children}
    </p>
  );
};

export default Body1;
