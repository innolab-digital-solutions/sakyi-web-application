'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/styles';

type SectionCardTitleProps = {
  children: ReactNode;
  as?: 'h3' | 'h4';
  className?: string;
};

/**
 * Title typography for section cards (e.g. step cards, feature list items).
 * Keeps card/feature titles consistent across the site.
 */
const SectionCardTitle = ({
  children,
  as: Tag = 'h3',
  className,
}: SectionCardTitleProps) => {
  return (
    <Tag
      className={cn(
        'text-foreground min-w-0 wrap-break-word font-sans text-base font-semibold leading-relaxed sm:text-lg',
        className,
      )}
    >
      {children}
    </Tag>
  );
};

export default SectionCardTitle;
