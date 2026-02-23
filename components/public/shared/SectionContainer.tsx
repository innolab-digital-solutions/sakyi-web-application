import { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils/common';

interface SectionContainerProps extends PropsWithChildren {
  id: string;
  className?: string;
}

const SectionContainer = ({
  id,
  className,
  children,
}: SectionContainerProps) => {
  return (
    <section
      id={id}
      className={cn('relative w-screen overflow-hidden py-24', className)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
};

export default SectionContainer;
