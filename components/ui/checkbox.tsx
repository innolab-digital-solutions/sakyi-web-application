'use client';

import { CheckIcon } from 'lucide-react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils/styles';

export type CheckboxVariant = 'default' | 'tableDense';

function Checkbox({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  /** Matches TextField `tableDense` (bg-background, neutral border, no shadow). */
  variant?: CheckboxVariant;
}) {
  return (
    <CheckboxPrimitive.Root
      data-slot='checkbox'
      className={cn(
        'peer focus-visible:border-ring focus-visible:ring-ring/50 size-4 shrink-0 rounded-md border transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary',
        variant === 'tableDense'
          ? 'bg-background border-neutral-200 shadow-none'
          : 'border-border bg-muted/50 dark:bg-input/30 shadow-xs',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot='checkbox-indicator'
        className='grid place-content-center text-current transition-none'
      >
        <CheckIcon className='size-2.5' />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
