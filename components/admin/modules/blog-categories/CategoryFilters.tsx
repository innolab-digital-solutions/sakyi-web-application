'use client';

import { ChevronDownIcon, LanguagesIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type BlogCategoryListLocale = 'en' | 'my';

type Props = {
  locale: BlogCategoryListLocale;
  onLocaleChange: (locale: BlogCategoryListLocale) => void;
};

const LOCALE_OPTIONS: { value: BlogCategoryListLocale; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'my', label: 'Myanmar' },
];

export default function BlogCategoryFilters({
  locale,
  onLocaleChange,
}: Props) {
  const currentLabel =
    LOCALE_OPTIONS.find((o) => o.value === locale)?.label ?? 'English';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='bg-background hover:bg-muted/70 data-[state=open]:bg-muted/80 hover:text-foreground h-11 cursor-pointer rounded-md border-neutral-200 px-3 text-[13px] font-medium'
        >
          <LanguagesIcon className='size-4 opacity-80' />
          <span>Language: {currentLabel}</span>
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
  );
}
