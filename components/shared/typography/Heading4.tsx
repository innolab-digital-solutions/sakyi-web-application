import type { PropsWithChildren } from 'react';

import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/config/languages';
import { cn } from '@/lib/utils/styles';

type Heading4Props = PropsWithChildren<{
  lang?: SupportedLanguage;
  className?: string;
}>;

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
