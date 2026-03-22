import type { PropsWithChildren } from 'react';

import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/config/languages';
import { cn } from '@/lib/utils/styles';

type Heading2Props = PropsWithChildren<{
  lang?: SupportedLanguage;
  className?: string;
}>;

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
