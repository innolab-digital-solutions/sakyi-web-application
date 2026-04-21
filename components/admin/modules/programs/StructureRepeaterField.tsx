'use client';

import { PlusIcon, Trash2Icon } from 'lucide-react';
import * as React from 'react';

import TextAreaField from '@/components/shared/form/TextAreaField';
import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import type { ProgramStructureItem } from '@/domains/programs/types/admin';
import { cn } from '@/lib/utils/styles';

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
  const rows = value.filter(
    (row) => row.period.trim() || row.title.trim() || row.description.trim(),
  );
  const [draftRow, setDraftRow] = React.useState<ProgramStructureItem>(() =>
    emptyRow(),
  );
  const periodError = error ? 'The period field is required.' : undefined;
  const titleError = error ? 'The title field is required.' : undefined;
  const descriptionError = error
    ? 'The description field is required.'
    : undefined;

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const addRow = () => {
    const nextRow = {
      period: draftRow.period.trim(),
      title: draftRow.title.trim(),
      description: draftRow.description.trim(),
    };
    if (!nextRow.period || !nextRow.title || !nextRow.description) return;
    onChange([...rows, nextRow]);
    setDraftRow(emptyRow());
  };

  return (
    <div className='border-border bg-muted/15 space-y-3 rounded-md border p-4 sm:p-4'>
      <div className='space-y-1'>
        <p className='text-foreground text-[13px] font-semibold'>
          {label} <span className='text-destructive'>*</span>
        </p>
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
            'border-border/70 bg-background/60 text-muted-foreground',
          )}
        >
          No structure items available. Add a period, title, and description to
          begin.
        </div>
      ) : (
        <ul className='space-y-3'>
          {rows.map((row, index) => (
            <li
              key={index}
              className='border-border bg-background rounded-md border px-3 py-2.5 text-sm shadow-xs'
            >
              <div className='flex items-center'>
                <span className='text-foreground/90 w-6 shrink-0 text-[13px] font-medium tabular-nums'>
                  {index + 1}.
                </span>
                <p className='text-foreground/90 line-clamp-1 min-w-0 flex-1 text-[13px] font-medium wrap-break-word'>
                  {row.period} - {row.title}
                </p>
                <button
                  type='button'
                  disabled={disabled}
                  onClick={() => removeRow(index)}
                  className={cn(
                    'text-muted-foreground hover:text-destructive shrink-0 rounded-sm p-1 transition-colors',
                    'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                    'disabled:pointer-events-none disabled:opacity-40',
                  )}
                  aria-label={`Remove structure block ${index + 1}`}
                >
                  <Trash2Icon className='size-3.5' />
                </button>
              </div>
              <p className='text-muted-foreground pt-1 pl-6 text-xs leading-snug font-medium wrap-break-word'>
                {row.description}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className='border-border my-4 border-t' />

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
        <TextField
          label='Period'
          disabled={disabled}
          placeholder='e.g. Week 1-2'
          value={draftRow.period}
          onChange={(e) =>
            setDraftRow((prev) => ({ ...prev, period: e.target.value }))
          }
          error={periodError}
        />
        <div className='sm:col-span-2'>
          <TextField
            label='Title'
            disabled={disabled}
            placeholder='Phase title'
            value={draftRow.title}
            onChange={(e) =>
              setDraftRow((prev) => ({ ...prev, title: e.target.value }))
            }
            error={titleError}
          />
        </div>
        <div className='sm:col-span-3'>
          <TextAreaField
            label='Description'
            disabled={disabled}
            placeholder='What happens in this phase'
            value={draftRow.description}
            onChange={(e) =>
              setDraftRow((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            className='min-h-18'
            error={descriptionError}
          />
        </div>
      </div>

      <Button
        type='button'
        variant='outline'
        disabled={
          disabled ||
          !draftRow.period.trim() ||
          !draftRow.title.trim() ||
          !draftRow.description.trim()
        }
        onClick={addRow}
        className='text-foreground bg-background hover:bg-muted h-10 w-full gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold md:h-12'
      >
        <PlusIcon className='size-3.5' />
        Add Structure Block
      </Button>
    </div>
  );
}
