import type { PropsWithChildren } from 'react';

import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/config/languages';
import { cn } from '@/lib/utils/styles';

type Heading5Props = PropsWithChildren<{
  lang?: SupportedLanguage;
  className?: string;
}>;

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
