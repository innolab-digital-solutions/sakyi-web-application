import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/styles';

export type PageHeaderProps = {
  /** Primary page heading (module or screen title). */
  title: ReactNode;
  /** Optional supporting line below the title. */
  description?: ReactNode;
  /**
   * Optional actions (e.g. create button). Rendered to the right on `sm+`
   * when present.
   */
  actions?: ReactNode;
  className?: string;
};

/**
 * Standard admin dashboard page title block: bold heading, optional muted
 * description, and optional trailing actions. Use on list and form entry
 * pages for consistent spacing and typography.
 */
export default function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  const hasActions = actions != null;

  return (
    <div
      className={cn(
        hasActions
          ? 'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'
          : 'flex flex-col space-y-1.5',
        className,
      )}
    >
      <div
        className={cn('flex flex-col space-y-1.5', hasActions && 'max-w-2xl')}
      >
        <h1 className='text-foreground text-md font-bold capitalize'>
          {title}
        </h1>
        {description != null && description !== '' && (
          <div className='text-muted-foreground text-sm font-medium'>
            {description}
          </div>
        )}
      </div>
      {hasActions && <div className='shrink-0'>{actions}</div>}
    </div>
  );
}
