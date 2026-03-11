'use client';

import type { PropsWithChildren } from 'react';

import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/config/languages';
import { cn } from '@/lib/utils/styles';

type Body2Props = PropsWithChildren<{
  lang?: SupportedLanguage;
  className?: string;
}>;

/**
 * Body2 is a presentational component that renders its children within a <p> tag,
 * applying standardized body text styles based on the specified language.
 *
 * - For Burmese ('my'), uses a slightly smaller font size and looser line height for typographic balance.
 * - For all other SupportedLanguage values, uses a larger font size and relaxed leading.
 *
 * @param {Body2Props} props
 * @param {SupportedLanguage} [props.lang=DEFAULT_LANGUAGE] - The language to determine typographic styles.
 * @param {string} [props.className] - Optional additional class names to append to the paragraph.
 * @param {React.ReactNode} props.children - The content of the paragraph.
 *
 * @returns {JSX.Element} Styled paragraph element.
 */
const Body2 = ({
  lang = DEFAULT_LANGUAGE,
  className,
  children,
}: Body2Props) => {
  return (
    <p
      className={cn(
        'max-w-full min-w-0 wrap-break-word',
        lang === 'my'
          ? 'text-foreground/80 font-sans text-sm leading-loose sm:text-base'
          : 'text-foreground/80 font-sans text-base leading-relaxed sm:text-lg',
        className,
      )}
    >
      {children}
    </p>
  );
};

export default Body2;
