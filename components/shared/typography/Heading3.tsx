'use client';

import type { PropsWithChildren } from 'react';

import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/config/languages';
import { cn } from '@/lib/utils/styles';

type Heading3Props = PropsWithChildren<{
  lang?: SupportedLanguage;
  className?: string;
}>;

/**
 * Heading3 is a presentational component that renders its children within an <h3> tag,
 * applying consistent typographic styles based on the provided language.
 *
 * - For Burmese ('my'), uses slightly smaller font sizes and relaxed line-height for legibility.
 * - For all other SupportedLanguage values, applies larger and tighter heading styles.
 *
 * @param {Heading3Props} props
 * @param {SupportedLanguage} [props.lang=DEFAULT_LANGUAGE] - The language used to determine heading styles.
 * @param {string} [props.className] - Optional additional class names for styling the heading.
 * @param {React.ReactNode} props.children - The content displayed inside the heading.
 *
 * @returns {JSX.Element} Styled h3 heading element.
 */
const Heading3 = ({
  lang = DEFAULT_LANGUAGE,
  className,
  children,
}: Heading3Props) => {
  return (
    <h3
      className={cn(
        'text-foreground min-w-0 wrap-break-word',
        lang === 'my'
          ? 'font-sans text-xl leading-relaxed font-semibold sm:text-2xl lg:text-3xl'
          : 'font-sans text-2xl leading-tight font-semibold sm:text-3xl lg:text-4xl',
        className,
      )}
    >
      {children}
    </h3>
  );
};

export default Heading3;
