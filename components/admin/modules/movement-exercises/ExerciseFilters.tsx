'use client';

import { FilterIcon, XIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type StatusFilter = 'all' | 'active' | 'inactive';
type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

type Props = {
  status: StatusFilter;
  difficulty: DifficultyFilter;
  onStatusChange: (status: StatusFilter) => void;
  onDifficultyChange: (difficulty: DifficultyFilter) => void;
};

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const DIFFICULTY_OPTIONS: { value: DifficultyFilter; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export default function ExerciseFilters({
  status,
  difficulty,
  onStatusChange,
  onDifficultyChange,
}: Props) {
  const hasStatusFilter = status !== 'all';
  const hasDifficultyFilter = difficulty !== 'all';

  return (
    <div className='flex items-center gap-2'>
      {/* Difficulty filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            className='border-border h-11 cursor-pointer gap-2 hover:bg-transparent'
          >
            <FilterIcon className='size-3.5' />
            Difficulty
            {hasDifficultyFilter && (
              <Badge
                variant='secondary'
                className='px-1.5 py-0 text-xs font-normal capitalize'
              >
                {difficulty}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-44'>
          <DropdownMenuLabel className='text-xs'>
            Filter by difficulty
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {DIFFICULTY_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className='cursor-pointer'
                onClick={() => onDifficultyChange(option.value)}
              >
                <span
                  className={
                    difficulty === option.value ? 'font-medium' : 'font-normal'
                  }
                >
                  {option.label}
                </span>
                {difficulty === option.value && (
                  <span className='bg-primary ml-auto size-1.5 rounded-full' />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          {hasDifficultyFilter && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='text-muted-foreground cursor-pointer gap-2'
                onClick={() => onDifficultyChange('all')}
              >
                <XIcon className='size-3.5' />
                Clear filter
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            className='border-border h-11 cursor-pointer gap-2 hover:bg-transparent'
          >
            <FilterIcon className='size-3.5' />
            Status
            {hasStatusFilter && (
              <Badge
                variant='secondary'
                className='px-1.5 py-0 text-xs font-normal'
              >
                {STATUS_OPTIONS.find((o) => o.value === status)?.label}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-40'>
          <DropdownMenuLabel className='text-xs'>
            Filter by status
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {STATUS_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className='cursor-pointer'
                onClick={() => onStatusChange(option.value)}
              >
                <span
                  className={
                    status === option.value ? 'font-medium' : 'font-normal'
                  }
                >
                  {option.label}
                </span>
                {status === option.value && (
                  <span className='bg-primary ml-auto size-1.5 rounded-full' />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          {hasStatusFilter && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='text-muted-foreground cursor-pointer gap-2'
                onClick={() => onStatusChange('all')}
              >
                <XIcon className='size-3.5' />
                Clear filter
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
