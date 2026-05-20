import { ArrowUpRightIcon } from 'lucide-react';

import { cn } from '@/lib/utils/styles';

type PublishedMarketingTitleLinkProps = {
  title: string;
  href: string;
  className?: string;
};

/**
 * Title link for published content on the public marketing site (new tab).
 */
export default function PublishedMarketingTitleLink({
  title,
  href,
  className,
}: PublishedMarketingTitleLinkProps) {
  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className={cn(
        'text-foreground hover:text-primary inline-flex max-w-full min-w-0 items-center gap-1',
        'text-[13px] font-semibold transition-colors',
        'focus-visible:ring-ring rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
        className,
      )}
    >
      <span className='line-clamp-1 min-w-0 wrap-break-word'>{title}</span>
      <ArrowUpRightIcon className='size-3.5 shrink-0 opacity-70' aria-hidden />
      <span className='sr-only'> (opens on marketing site in a new tab)</span>
    </a>
  );
}
