'use client';

import {
  ChevronDownIcon,
  LanguagesIcon,
  SlidersHorizontalIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BlogPostStatus } from '@/domains/blogs/types';

export type BlogPostListLocale = 'en' | 'my';

type StatusFilter = 'all' | BlogPostStatus;

const STATUS_LABELS: Record<BlogPostStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
};

const LOCALE_OPTIONS: { value: BlogPostListLocale; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'my', label: 'Myanmar' },
];

type Props = {
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  locale: BlogPostListLocale;
  onLocaleChange: (locale: BlogPostListLocale) => void;
};

export default function BlogPostFilters({
  status,
  onStatusChange,
  locale,
  onLocaleChange,
}: Props) {
  const statusLabel =
    status === 'all' ? 'All' : STATUS_LABELS[status as BlogPostStatus];
  const localeLabel =
    LOCALE_OPTIONS.find((o) => o.value === locale)?.label ?? 'English';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            className='bg-background hover:bg-muted/70 data-[state=open]:bg-muted/80 hover:text-foreground h-11 cursor-pointer rounded-md border-neutral-200 px-3 text-[13px] font-medium'
          >
            <SlidersHorizontalIcon className='size-4 opacity-80' />
            <span>Status: {statusLabel}</span>
            <ChevronDownIcon className='size-3.5 opacity-70' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem
            className='cursor-pointer'
            onClick={() => onStatusChange('all')}
          >
            All statuses
          </DropdownMenuItem>
          {(Object.keys(STATUS_LABELS) as BlogPostStatus[]).map((s) => (
            <DropdownMenuItem
              key={s}
              className='cursor-pointer'
              onClick={() => onStatusChange(s)}
            >
              {STATUS_LABELS[s]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            className='bg-background hover:bg-muted/70 data-[state=open]:bg-muted/80 hover:text-foreground h-11 cursor-pointer rounded-md border-neutral-200 px-3 text-[13px] font-medium'
          >
            <LanguagesIcon className='size-4 opacity-80' />
            <span>Language: {localeLabel}</span>
            <ChevronDownIcon className='size-3.5 opacity-70' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {LOCALE_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              className='cursor-pointer'
              onClick={() => onLocaleChange(option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
