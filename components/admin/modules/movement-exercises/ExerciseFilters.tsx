'use client';

import { ChevronDownIcon, GaugeIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DIFFICULTY_VALUES = ['beginner', 'intermediate', 'advanced'] as const;

function formatDifficultyLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

type ExerciseFiltersProps = {
  /** Raw `difficulty` query value, or empty when all levels. */
  difficultyFilter: string | undefined;
  onClearDifficulty: () => void;
  onSetDifficulty: (difficulty: string) => void;
};

export default function ExerciseFilters({
  difficultyFilter,
  onClearDifficulty,
  onSetDifficulty,
}: ExerciseFiltersProps) {
  const difficultyLabel =
    difficultyFilter &&
    DIFFICULTY_VALUES.includes(
      difficultyFilter as (typeof DIFFICULTY_VALUES)[number],
    )
      ? formatDifficultyLabel(difficultyFilter)
      : 'All';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='bg-background hover:bg-muted/70 data-[state=open]:bg-muted/80 hover:text-foreground h-11 cursor-pointer rounded-md border-neutral-200 px-3 text-[13px] font-medium'
        >
          <GaugeIcon className='size-4 opacity-80' />
          <span>Difficulty: {difficultyLabel}</span>
          <ChevronDownIcon className='size-3.5 opacity-70' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem
          className='cursor-pointer'
          onClick={onClearDifficulty}
        >
          All levels
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {DIFFICULTY_VALUES.map((value) => (
          <DropdownMenuItem
            key={value}
            className='cursor-pointer'
            onClick={() => onSetDifficulty(value)}
          >
            {formatDifficultyLabel(value)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
