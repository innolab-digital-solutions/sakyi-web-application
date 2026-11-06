'use client';

import { ChevronDownIcon, SlidersHorizontalIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UNIT_TYPE } from '@/domains/units/constants';

const UNIT_TYPE_LIST = Object.values(UNIT_TYPE) as string[];

function formatTypeMenuLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

type UnitFiltersProps = {
  /** Raw `type` query value, or empty / undefined when showing all types. */
  typeFilter: string | undefined;
  onClearType: () => void;
  onSetType: (type: string) => void;
};

export default function UnitFilters({
  typeFilter,
  onClearType,
  onSetType,
}: UnitFiltersProps) {
  const typeLabel =
    typeFilter && UNIT_TYPE_LIST.includes(typeFilter)
      ? formatTypeMenuLabel(typeFilter)
      : 'All';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='bg-background hover:bg-muted/70 data-[state=open]:bg-muted/80 hover:text-foreground h-11 cursor-pointer rounded-md border-neutral-200 px-3 text-[13px] font-medium'
        >
          <SlidersHorizontalIcon className='size-4 opacity-80' />
          <span>Type: {typeLabel}</span>
          <ChevronDownIcon className='size-3.5 opacity-70' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem className='cursor-pointer' onClick={onClearType}>
          All types
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {UNIT_TYPE_LIST.map((value) => (
          <DropdownMenuItem
            key={value}
            className='cursor-pointer'
            onClick={() => onSetType(value)}
          >
            {formatTypeMenuLabel(value)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
