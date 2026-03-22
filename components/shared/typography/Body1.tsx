import type { PropsWithChildren } from 'react';

import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/config/languages';
import { cn } from '@/lib/utils/styles';

type Body1Props = PropsWithChildren<{
  lang?: SupportedLanguage;
  className?: string;
}>;

const Body1 = ({
  lang = DEFAULT_LANGUAGE,
  className,
  children,
}: Body1Props) => {
  return (
    <p
      style={{ fontFamily: 'Poppins, sans-serif' }}
      className={cn(
        'max-w-full min-w-0 wrap-break-word',
        lang === 'my'
          ? 'text-foreground/80 font-sans text-base leading-loose sm:text-lg'
          : 'text-foreground/80 font-sans text-lg leading-relaxed',
        className,
      )}
    >
      {children}
    </p>
  );
};

export default Body1;
