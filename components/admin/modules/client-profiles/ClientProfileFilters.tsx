'use client';

import {
  ChevronDownIcon,
  Columns3Icon,
  RotateCcwIcon,
  VenusAndMarsIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type ClientProfileColumnOption = {
  key: string;
  label: string;
};

export type ClientProfileGenderValue = 'male' | 'female' | 'other';

export const CLIENT_PROFILE_GENDER_OPTIONS: readonly ClientProfileGenderValue[] =
  ['male', 'female', 'other'];

const GENDER_LABEL: Record<ClientProfileGenderValue, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
};

type ClientProfileFiltersProps = {
  genderFilter: 'all' | ClientProfileGenderValue;
  onClearGender: () => void;
  onSetGender: (gender: ClientProfileGenderValue) => void;
  columns: readonly ClientProfileColumnOption[];
  visibleColumnKeys: readonly string[];
  onToggleColumn: (columnKey: string) => void;
  onResetColumns: () => void;
};

export default function ClientProfileFilters({
  genderFilter,
  onClearGender,
  onSetGender,
  columns,
  visibleColumnKeys,
  onToggleColumn,
  onResetColumns,
}: ClientProfileFiltersProps) {
  const visibleColumnSet = new Set(visibleColumnKeys);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            className='bg-background hover:bg-muted/70 data-[state=open]:bg-muted/80 hover:text-foreground h-11 cursor-pointer rounded-md border-neutral-200 px-3 text-[13px] font-medium'
          >
            <VenusAndMarsIcon className='size-4 opacity-80' />
            <span>
              Gender:{' '}
              {genderFilter === 'all' ? 'All' : GENDER_LABEL[genderFilter]}
            </span>
            <ChevronDownIcon className='size-3.5 opacity-70' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem className='cursor-pointer' onClick={onClearGender}>
            All genders
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {CLIENT_PROFILE_GENDER_OPTIONS.map((g) => (
            <DropdownMenuItem
              key={g}
              className='cursor-pointer'
              onClick={() => onSetGender(g)}
            >
              {GENDER_LABEL[g]}
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
            <Columns3Icon className='size-4 opacity-80' />
            <span>Columns</span>
            <ChevronDownIcon className='size-3.5 opacity-70' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='min-w-56'>
          <DropdownMenuLabel className='text-foreground/80 px-2 py-1 text-[13px] font-semibold tracking-wide'>
            Column Visibility
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.key}
                className='cursor-pointer'
                checked={visibleColumnSet.has(column.key)}
                onSelect={(event) => event.preventDefault()}
                onCheckedChange={() => onToggleColumn(column.key)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant='destructive'
            className='cursor-pointer font-semibold'
            onClick={onResetColumns}
          >
            <RotateCcwIcon className='size-4' />
            Reset columns
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
