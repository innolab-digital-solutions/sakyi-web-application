import type { PropsWithChildren } from 'react';

import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/config/languages';
import { cn } from '@/lib/utils/styles';

type Heading6Props = PropsWithChildren<{
  lang?: SupportedLanguage;
  className?: string;
}>;

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
