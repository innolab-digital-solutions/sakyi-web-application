'use client';

import Link from 'next/link';
import type { PropsWithChildren } from 'react';

import { cn } from '@/lib/utils/styles';

type PrimaryCtaLinkProps = PropsWithChildren<{
  href: string;
  className?: string;
}>;

const PrimaryCtaLink = ({ href, className, children }: PrimaryCtaLinkProps) => {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white bg-white px-6 py-3 font-sans text-base font-semibold text-[#35bec5] transition-all duration-300 hover:scale-105 hover:bg-slate-50 hover:shadow-lg sm:w-auto sm:px-8 sm:py-4',
        className,
      )}
    >
      {children}
    </Link>
  );
};

export default PrimaryCtaLink;

