'use client';

import type { PropsWithChildren } from 'react';

import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/config/languages';
import { cn } from '@/lib/utils/styles';

type Heading6Props = PropsWithChildren<{
  lang?: SupportedLanguage;
  className?: string;
}>;

/**
 * Heading6 is a presentational component that renders its children within an <h6> tag,
 * adapting typographic styles for the specified language for accessibility and consistency.
 *
 * - For Burmese ('my'), applies a smaller base font size and relaxed line height.
 * - For all other SupportedLanguage values, uses a slightly larger font size and tighter line height.
 *
 * @param {Heading6Props} props
 * @param {SupportedLanguage} [props.lang=DEFAULT_LANGUAGE] - The language used to determine heading styles.
 * @param {string} [props.className] - Additional class names applied to the heading element.
 * @param {React.ReactNode} props.children - The content to display inside the heading.
 * @returns {JSX.Element} Styled h6 heading element.
 */
const Heading6 = ({
  lang = DEFAULT_LANGUAGE,
  className,
  children,
}: Heading6Props) => {
  return (
    <h6
      style={{ fontFamily: 'Poppins, sans-serif' }}
      className={cn(
        'text-foreground min-w-0 wrap-break-word',
        lang === 'my'
          ? 'font-sans text-sm leading-relaxed font-semibold sm:text-base'
          : 'font-sans text-base leading-tight font-semibold text-slate-900 sm:text-base',
        className,
      )}
    >
      {children}
    </h6>
  );
};

export default Heading6;
