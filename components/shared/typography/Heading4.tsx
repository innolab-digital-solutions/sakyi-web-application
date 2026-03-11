'use client';

import type { PropsWithChildren } from 'react';

import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/config/languages';
import { cn } from '@/lib/utils/styles';

type Heading4Props = PropsWithChildren<{
  lang?: SupportedLanguage;
  className?: string;
}>;

/**
 * Heading4 is a presentational component that renders its children within an <h4> tag,
 * applying appropriate typographic styles based on the provided language.
 *
 * - For Burmese ('my'), it uses a slightly smaller font size and more relaxed line height for greater legibility.
 * - For all other SupportedLanguage values, it applies more prominent sizing and tighter heading tracking.
 *
 * @param {Heading4Props} props
 * @param {SupportedLanguage} [props.lang=DEFAULT_LANGUAGE] - The language used to determine heading styles.
 * @param {string} [props.className] - Additional CSS class names for the heading element.
 * @param {React.ReactNode} props.children - The content displayed inside the heading.
 * @returns {JSX.Element} Styled h4 heading element.
 */
const Heading4 = ({
  lang = DEFAULT_LANGUAGE,
  className,
  children,
}: Heading4Props) => {
  return (
    <h4
      className={cn(
        'text-foreground min-w-0 wrap-break-word',
        lang === 'my'
          ? 'font-sans text-lg leading-relaxed font-semibold sm:text-xl lg:text-2xl'
          : 'font-sans text-xl leading-tight font-semibold sm:text-2xl lg:text-3xl',
        className,
      )}
    >
      {children}
    </h4>
  );
};

export default Heading4;
