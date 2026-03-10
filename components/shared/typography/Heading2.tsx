'use client';

import type { PropsWithChildren } from 'react';

import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/config/languages';
import { cn } from '@/lib/utils/styles';

type Heading2Props = PropsWithChildren<{
  lang?: SupportedLanguage;
  className?: string;
}>;

/**
 * Heading2 component renders an <h2> element with responsive typography styles,
 * adapting font size, weight, and spacing based on the input language.
 *
 * - For the Myanmar language ('my'), uses distinct size and leading for improved readability.
 * - For all other languages, applies larger and tighter heading styles.
 *
 * @param {Heading2Props} props
 * @param {SupportedLanguage} [props.lang=DEFAULT_LANGUAGE] - Language code to determine heading style.
 * @param {string} [props.className] - Additional CSS classes to apply.
 * @param {React.ReactNode} props.children - Content to display inside the heading.
 * @returns {JSX.Element} Styled h2 heading element.
 */
const Heading2 = ({
  lang = DEFAULT_LANGUAGE,
  className,
  children,
}: Heading2Props) => {
  return (
    <h2
      className={cn(
        'text-foreground min-w-0 wrap-break-word',
        lang === 'my'
          ? 'font-sans text-2xl leading-relaxed font-bold sm:text-3xl lg:text-4xl'
          : 'font-sans text-3xl leading-tight font-bold tracking-tight sm:text-4xl lg:text-5xl',
        className,
      )}
    >
      {children}
    </h2>
  );
};

export default Heading2;
