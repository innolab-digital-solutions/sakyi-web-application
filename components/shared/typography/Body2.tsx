import type { PropsWithChildren } from 'react';

import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/config/languages';
import { cn } from '@/lib/utils/styles';

type Body2Props = PropsWithChildren<{
  lang?: SupportedLanguage;
  className?: string;
}>;

const Body2 = ({
  lang = DEFAULT_LANGUAGE,
  className,
  children,
}: Body2Props) => {
  return (
    <p
      style={{ fontFamily: 'Inter, sans-serif' }}
      className={cn(
        'max-w-full min-w-0 wrap-break-word',
        lang === 'my'
          ? 'text-foreground/80 font-sans text-sm leading-loose sm:text-base'
          : 'text-foreground/80 font-sans text-base leading-relaxed sm:text-lg',
        className,
      )}
    >
      {children}
    </p>
  );
};

export default Body2;
