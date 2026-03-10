import { type ButtonHTMLAttributes, type PropsWithChildren } from 'react';

import { cn } from '@/lib/utils/styles';

type PrimaryButtonProps = PropsWithChildren<
  {
    className?: string;
  } & ButtonHTMLAttributes<HTMLButtonElement>
>;

const PrimaryButton = ({
  children,
  className,
  ...props
}: PrimaryButtonProps) => {
  return (
    <button
      className={cn(
        'group bg-brand-gradient inline-flex min-w-0 items-center justify-center space-x-2 rounded-full px-6 py-3 font-sans text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
