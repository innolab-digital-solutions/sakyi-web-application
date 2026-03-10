'use client';

import Link from 'next/link';
import type { PropsWithChildren } from 'react';

import { cn } from '@/lib/utils/styles';

type SecondaryCtaLinkProps = PropsWithChildren<{
  href: string;
  className?: string;
}>;

const SecondaryCtaLink = ({
  href,
  className,
  children,
}: SecondaryCtaLinkProps) => {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white px-6 py-3 font-sans text-base font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-white hover:text-[#35bec5] hover:shadow-lg sm:w-auto sm:px-8 sm:py-4',
        className,
      )}
    >
      {children}
    </Link>
  );
};

export default SecondaryCtaLink;

