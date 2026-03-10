'use client';

import type { PropsWithChildren } from 'react';

import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/config/languages';
import { cn } from '@/lib/utils/styles';

type Body4Props = PropsWithChildren<{
  lang?: SupportedLanguage;
  className?: string;
}>;

/**
 * Body4 is a presentational component that renders its children within a <p> tag,
 * applying very small body text styles based on the provided language.
 *
 * - For Burmese ('my'), uses an even smaller font size and looser line height for optimal legibility.
 * - For other SupportedLanguage values, uses extra-small font size and relaxed line height.
 *
 * @param {Body4Props} props
 * @param {SupportedLanguage} [props.lang=DEFAULT_LANGUAGE] - The language used to determine typographic styles.
 * @param {string} [props.className] - Optional additional class names for styling the paragraph.
 * @param {React.ReactNode} props.children - The content displayed inside the paragraph.
 *
 * @returns {JSX.Element} Styled paragraph element for very small body text.
 */
const Body4 = ({
  lang = DEFAULT_LANGUAGE,
  className,
  children,
}: Body4Props) => {
  return (
    <p
      className={cn(
        'max-w-full min-w-0 wrap-break-word',
        lang === 'my'
          ? 'text-foreground/80 font-sans text-[11px] leading-loose sm:text-xs'
          : 'text-foreground/80 font-sans text-xs leading-relaxed',
        className,
      )}
    >
      {children}
    </p>
  );
};

export default Body4;
