import type { PropsWithChildren } from 'react';

import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/config/languages';
import { cn } from '@/lib/utils/styles';

type Body3Props = PropsWithChildren<{
  lang?: SupportedLanguage;
  className?: string;
}>;

const Body3 = ({
  lang = DEFAULT_LANGUAGE,
  className,
  children,
}: Body3Props) => {
  return (
    <p
      style={{ fontFamily: 'Inter, sans-serif' }}
      className={cn(
        'max-w-full min-w-0 wrap-break-word',
        lang === 'my'
          ? 'text-foreground/80 font-sans text-xs leading-loose sm:text-sm'
          : 'text-foreground/80 font-sans text-sm leading-relaxed sm:text-base',
        className,
      )}
    >
      {children}
    </p>
  );
};

export default Body3;
