import type { PropsWithChildren } from 'react';

import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/config/languages';
import { cn } from '@/lib/utils/styles';

type Heading1Props = PropsWithChildren<{
  lang?: SupportedLanguage;
  className?: string;
}>;

const Heading1 = ({
  lang = DEFAULT_LANGUAGE,
  className,
  children,
}: Heading1Props) => {
  return (
    <h1
      className={cn(
        'text-foreground min-w-0 wrap-break-word',
        lang === 'my'
          ? 'font-sans text-3xl leading-relaxed font-bold sm:text-4xl lg:text-5xl'
          : 'font-sans text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl',
        className,
      )}
    >
      {children}
    </h1>
  );
};

export default Heading1;
