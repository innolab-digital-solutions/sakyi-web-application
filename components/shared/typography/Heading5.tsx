'use client';

import type { PropsWithChildren } from 'react';

import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/config/languages';
import { cn } from '@/lib/utils/styles';

type Heading5Props = PropsWithChildren<{
  lang?: SupportedLanguage;
  className?: string;
}>;

/**
 * Heading5 is a presentational component that renders its children within an <h5> tag,
 * applying typographic styles that adapt to the provided language for consistency and legibility.
 *
 * - For Burmese ('my'), it uses a base font size with relaxed line height for accessibility.
 * - For all other SupportedLanguage values, it applies a slightly larger font size and tighter line height for more impact.
 *
 * @param {Heading5Props} props
 * @param {SupportedLanguage} [props.lang=DEFAULT_LANGUAGE] - The language used to determine heading styles.
 * @param {string} [props.className] - Additional class names for the heading element.
 * @param {React.ReactNode} props.children - The content displayed inside the heading.
 * @returns {JSX.Element} Styled h5 heading element.
 */
const Heading5 = ({
  lang = DEFAULT_LANGUAGE,
  className,
  children,
}: Heading5Props) => {
  return (
    <h5
      className={cn(
        'text-foreground min-w-0 wrap-break-word',
        lang === 'my'
          ? 'font-sans text-base leading-relaxed font-semibold sm:text-lg'
          : 'font-sans text-lg leading-tight font-semibold sm:text-xl',
        className,
      )}
    >
      {children}
    </h5>
  );
};

export default Heading5;
