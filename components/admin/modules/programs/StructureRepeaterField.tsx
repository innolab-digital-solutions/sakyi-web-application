'use client';

import { AlertCircle, PlusIcon, Trash2Icon } from 'lucide-react';

import TextAreaField from '@/components/shared/form/TextAreaField';
import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/styles';
import type { ProgramStructureItem } from '@/domains/programs/types/admin';

type Props = {
  label: string;
  description?: string;
  value: ProgramStructureItem[];
  onChange: (value: ProgramStructureItem[]) => void;
  error?: string;
  disabled?: boolean;
};

const emptyRow = (): ProgramStructureItem => ({
  period: '',
  title: '',
  description: '',
});

export default function StructureRepeaterField({
  label,
  description,
  value,
  onChange,
  error,
  disabled = false,
}: Props) {
  const rows = value.length > 0 ? value : [];

  const updateRow = (
    index: number,
    field: keyof ProgramStructureItem,
    fieldValue: string,
  ) => {
    const next = rows.map((row, i) =>
      i === index ? { ...row, [field]: fieldValue } : row,
    );
    onChange(next);
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const addRow = () => {
    onChange([...rows, emptyRow()]);
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

      {rows.length === 0 ? (
        <div
          className={cn(
            'rounded-md border border-dashed py-8 text-center text-xs font-medium',
            error
              ? 'border-destructive/60 bg-destructive/4 text-destructive/90'
              : 'border-border/70 bg-background/60 text-muted-foreground',
          )}
        >
          No structure blocks yet. Add a period with title and description.
        </div>
      ) : (
        <ul className='space-y-3'>
          {rows.map((row, index) => (
            <li
              key={index}
              className='border-border bg-background space-y-3 rounded-md border p-3 shadow-xs sm:p-4'
            >
              <div className='flex items-center justify-between gap-2'>
                <span className='text-muted-foreground text-[11px] font-semibold tracking-wide uppercase'>
                  Phase {index + 1}
                </span>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  disabled={disabled}
                  onClick={() => removeRow(index)}
                  className='text-destructive hover:text-destructive h-8 gap-1 px-2 text-[13px]! font-semibold'
                >
                  <Trash2Icon className='size-3.5' />
                  Remove
                </Button>
              </div>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                <TextField
                  label='Period'
                  disabled={disabled}
                  placeholder='e.g. Week 1–2'
                  value={row.period}
                  onChange={(e) =>
                    updateRow(index, 'period', e.target.value)
                  }
                />
                <div className='sm:col-span-2'>
                  <TextField
                    label='Title'
                    disabled={disabled}
                    placeholder='Phase title'
                    value={row.title}
                    onChange={(e) =>
                      updateRow(index, 'title', e.target.value)
                    }
                  />
                </div>
                <div className='sm:col-span-3'>
                  <TextAreaField
                    label='Description'
                    disabled={disabled}
                    placeholder='What happens in this phase'
                    value={row.description}
                    onChange={(e) =>
                      updateRow(index, 'description', e.target.value)
                    }
                    rows={3}
                    className='min-h-18'
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Button
        type='button'
        variant='outline'
        disabled={disabled}
        onClick={addRow}
        className={cn(
          'h-10 w-full gap-1.5 rounded-md px-3 text-[13px]! font-semibold md:h-12 sm:w-auto',
          error
            ? 'border-destructive/60 bg-destructive/4 text-destructive hover:bg-destructive/10'
            : 'text-foreground border-neutral-300 bg-background hover:bg-muted',
        )}
      >
        <PlusIcon className='size-3.5' />
        Add structure block
      </Button>

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
