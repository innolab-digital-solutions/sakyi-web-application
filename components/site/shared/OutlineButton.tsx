import { type PropsWithChildren } from 'react';

import { cn } from '@/lib/utils/styles';

type OutlineButtonProps = PropsWithChildren<{
  className?: string;
}>;

const OutlineButton = ({ children, className }: OutlineButtonProps) => {
  return (
    <button
      className={cn(
        'group text-foreground/80 inline-flex min-w-0 items-center justify-center space-x-2 rounded-full border border-gray-300 bg-white px-6 py-3 font-sans text-base font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:border-[#35bec5] hover:text-[#35bec5] hover:shadow-lg',
        className,
      )}
    >
      {children}
    </button>
  );
};

export default OutlineButton;
