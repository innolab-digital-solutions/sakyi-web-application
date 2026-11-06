import type { PropsWithChildren } from 'react';

import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/config/languages';
import { cn } from '@/lib/utils/styles';

type Body4Props = PropsWithChildren<{
  lang?: SupportedLanguage;
  className?: string;
}>;

const Body4 = ({
  lang = DEFAULT_LANGUAGE,
  className,
  children,
}: Body4Props) => {
  return (
    <p
      className={cn(
        'max-w-full min-w-0 wrap-break-word',
        lang === 'my'
          ? 'text-foreground/80 font-sans text-[11px] leading-loose sm:text-xs'
          : 'text-foreground/80 font-sans text-xs leading-relaxed',
        className,
      )}
    >
      {children}
    </p>
  );
};

export default Body4;
