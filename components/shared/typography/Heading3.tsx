import type { PropsWithChildren } from 'react';

import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/config/languages';
import { cn } from '@/lib/utils/styles';

type Heading3Props = PropsWithChildren<{
  lang?: SupportedLanguage;
  className?: string;
}>;

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
