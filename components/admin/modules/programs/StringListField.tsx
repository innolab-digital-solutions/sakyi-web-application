'use client';

import { AlertCircle, PlusIcon, Trash2Icon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils/styles';

type StringListFieldProps = {
  label?: string;
  description?: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
};

/**
 * Editable ordered list of plain strings. Items are added via an input + "Add" button
 * (or pressing Enter) and removed individually with a trash icon.
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
    <div className='space-y-2'>
      {label && (
        <Label className='text-xs font-medium md:text-sm'>{label}</Label>
      )}
      {description && (
        <p className='text-muted-foreground text-xs'>{description}</p>
      )}

      {value.length > 0 && (
        <ul className='space-y-1.5'>
          {value.map((item, index) => (
            <li
              key={index}
              className='bg-muted/40 border-border/50 flex items-center gap-2 rounded-md border px-3 py-2 text-sm'
            >
              <span className='text-muted-foreground mr-1 shrink-0 text-xs tabular-nums'>
                {index + 1}.
              </span>
              <span className='min-w-0 flex-1 truncate'>{item}</span>
              <button
                type='button'
                disabled={disabled}
                onClick={() => handleRemove(index)}
                className={cn(
                  'text-muted-foreground hover:text-destructive shrink-0 rounded-sm p-0.5 transition-colors',
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
      )}

      {value.length === 0 && (
        <p className='text-muted-foreground rounded-md border border-dashed px-3 py-3 text-center text-xs'>
          No items yet. Add one below.
        </p>
      )}

      <div className='flex gap-2'>
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className='h-10 border-neutral-200 px-3 text-xs font-medium md:h-12 md:px-4 md:text-sm'
        />
        <Button
          type='button'
          variant='outline'
          disabled={disabled || !inputValue.trim()}
          onClick={handleAdd}
          className='h-10 shrink-0 md:h-12'
        >
          <PlusIcon className='size-4' />
          Add
        </Button>
      </div>

      {error && (
        <p
          className='text-destructive flex items-center gap-2 text-xs font-medium md:text-sm'
          role='alert'
        >
          <AlertCircle className='size-4 shrink-0' />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
