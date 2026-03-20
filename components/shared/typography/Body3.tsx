'use client';

import type { PropsWithChildren } from 'react';

import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/config/languages';
import { cn } from '@/lib/utils/styles';

type Body3Props = PropsWithChildren<{
  lang?: SupportedLanguage;
  className?: string;
}>;

/**
 * Body3 is a presentational component that renders its children within a <p> tag,
 * applying standardized small-body text styles based on the specified language.
 *
 * - For Burmese ('my'), uses extra-small font size and a looser line height for optimal readability.
 * - For all other SupportedLanguage values, uses a small font size and relaxed leading.
 *
 * @param {Body3Props} props
 * @param {SupportedLanguage} [props.lang=DEFAULT_LANGUAGE] - The language used to determine typographic styling.
 * @param {string} [props.className] - Optional additional class names for the paragraph.
 * @param {React.ReactNode} props.children - The paragraph content.
 *
 * @returns {JSX.Element} Styled paragraph element for small body text.
 */
const Body3 = ({
  lang = DEFAULT_LANGUAGE,
  className,
  children,
}: Body3Props) => {
  return (
    <p
      style={{ fontFamily: 'Inter, sans-serif' }}
      className={cn(
        'max-w-full min-w-0 wrap-break-word',
        lang === 'my'
          ? 'text-foreground/80 font-sans text-xs leading-loose sm:text-sm'
          : 'text-foreground/80 font-sans text-sm leading-relaxed sm:text-base',
        className,
      )}
    >
      {children}
    </p>
  );
};

export default Body3;
