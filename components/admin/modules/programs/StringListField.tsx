'use client';

import { AlertCircle, PlusIcon, Trash2Icon } from 'lucide-react';
import * as React from 'react';

import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/styles';

type StringListFieldProps = {
  label: string;
  description?: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
};

/**
 * Editable ordered list of plain strings, styled like other admin form subsections
 * (blog post / program content cards).
 */
export default function StringListField({
  label,
  description,
  value,
  onChange,
  placeholder = 'Add an item…',
  error,
  disabled = false,
}: StringListFieldProps) {
  const [inputValue, setInputValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onChange([...value, trimmed]);
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div
      className={cn(
        'space-y-3 rounded-md border p-4 sm:p-4',
        error
          ? 'border-destructive bg-destructive/4'
          : 'border-border bg-muted/15',
      )}
    >
      <div className='space-y-1'>
        <p className='text-foreground text-sm font-semibold'>{label}</p>
        {description ? (
          <p className='text-muted-foreground text-xs leading-relaxed font-medium'>
            {description}
          </p>
        ) : null}
      </div>

      {value.length > 0 ? (
        <ul className='space-y-2'>
          {value.map((item, index) => (
            <li
              key={index}
              className='border-border bg-background flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm shadow-xs'
            >
              <span className='text-muted-foreground w-6 shrink-0 text-xs font-semibold tabular-nums'>
                {index + 1}
              </span>
              <span className='min-w-0 flex-1 leading-snug wrap-break-word'>
                {item}
              </span>
              <button
                type='button'
                disabled={disabled}
                onClick={() => handleRemove(index)}
                className={cn(
                  'text-muted-foreground hover:text-destructive shrink-0 rounded-sm p-1 transition-colors',
                  'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                  'disabled:pointer-events-none disabled:opacity-40',
                )}
                aria-label={`Remove item ${index + 1}`}
              >
                <Trash2Icon className='size-3.5' />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div
          className={cn(
            'rounded-md border border-dashed py-8 text-center text-xs font-medium',
            error
              ? 'border-destructive/60 bg-destructive/4 text-destructive/90'
              : 'border-border/70 bg-background/60 text-muted-foreground',
          )}
        >
          No items yet. Add one below.
        </div>
      )}

      <div className='flex flex-col gap-2 sm:flex-row sm:items-end'>
        <div className='min-w-0 flex-1'>
          <TextField
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={
              error
                ? 'border-destructive bg-destructive/4 focus-visible:ring-destructive/20'
                : undefined
            }
          />
        </div>
        <Button
          type='button'
          variant='outline'
          disabled={disabled || !inputValue.trim()}
          onClick={handleAdd}
          className={cn(
            'h-10 shrink-0 gap-1.5 rounded-md px-3 text-[13px]! font-semibold md:h-12 sm:w-auto',
            error
              ? 'border-destructive/60 bg-destructive/4 text-destructive hover:bg-destructive/8'
              : 'text-foreground border-neutral-300 bg-background hover:bg-muted',
          )}
        >
          <PlusIcon className='size-3.5' />
          Add
        </Button>
      </div>

      {error ? (
        <p
          className='text-destructive flex items-center gap-2 text-xs font-medium md:text-[13px]'
          role='alert'
        >
          <AlertCircle className='size-4 shrink-0' />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
