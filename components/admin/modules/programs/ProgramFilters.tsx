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
import { STATUS } from '@/domains/programs/constants';
import type { Program } from '@/domains/programs/types/admin';

export type ProgramListLocale = 'en' | 'my';

/** Status values exposed in the list filter (archived is omitted by product choice). */
export type ProgramTableStatusFilter =
  | 'all'
  | Exclude<Program['status'], typeof STATUS.ARCHIVED>;

const STATUS_LABELS: Record<Program['status'], string> = {
  [STATUS.DRAFT]: 'Draft',
  [STATUS.PUBLISHED]: 'Published',
  [STATUS.ARCHIVED]: 'Archived',
  [STATUS.HIDDEN]: 'Hidden',
};

const FILTERABLE_STATUS_ORDER: Exclude<
  Program['status'],
  typeof STATUS.ARCHIVED
>[] = [STATUS.DRAFT, STATUS.PUBLISHED, STATUS.HIDDEN];

const LOCALE_OPTIONS: { value: ProgramListLocale; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'my', label: 'Myanmar' },
];

type Props = {
  /** Current filter from URL; may be `archived` if the query string still requests it. */
  status: ProgramTableStatusFilter | typeof STATUS.ARCHIVED;
  onStatusChange: (status: ProgramTableStatusFilter) => void;
  locale: ProgramListLocale;
  onLocaleChange: (locale: ProgramListLocale) => void;
};

export default function ProgramFilters({
  status,
  onStatusChange,
  locale,
  onLocaleChange,
}: Props) {
  const statusLabel =
    status === 'all' ? 'All' : STATUS_LABELS[status as Program['status']];
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
          {FILTERABLE_STATUS_ORDER.map((s) => (
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
