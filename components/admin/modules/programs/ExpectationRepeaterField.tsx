'use client';

import { PlusIcon, Trash2Icon } from 'lucide-react';
import * as React from 'react';

import TextAreaField from '@/components/shared/form/TextAreaField';
import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import type { ProgramExpectationItem } from '@/domains/programs/types/admin';
import { cn } from '@/lib/utils/styles';

type Props = {
  label: string;
  description?: string;
  value: ProgramExpectationItem[];
  onChange: (value: ProgramExpectationItem[]) => void;
  locale?: 'en' | 'my';
  error?: string;
  disabled?: boolean;
};

const emptyRow = (): ProgramExpectationItem => ({ title: '', description: '' });

export default function ExpectationRepeaterField({
  label,
  description,
  value,
  onChange,
  locale = 'en',
  error,
  disabled = false,
}: Props) {
  const rows = value.filter(
    (row) => row.title.trim() || row.description.trim(),
  );
  const [draftRow, setDraftRow] = React.useState<ProgramExpectationItem>(() =>
    emptyRow(),
  );
  const [hasAttempted, setHasAttempted] = React.useState(false);

  const draftTitleError =
    hasAttempted && !draftRow.title.trim()
      ? 'The title field is required.'
      : undefined;
  const draftDescriptionError =
    hasAttempted && !draftRow.description.trim()
      ? 'The description field is required.'
      : undefined;

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setHasAttempted(true);
    const nextRow = {
      title: draftRow.title.trim(),
      description: draftRow.description.trim(),
    };
    if (!nextRow.title || !nextRow.description) return;
    onChange([...rows, nextRow]);
    setDraftRow(emptyRow());
    setHasAttempted(false);
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
        {error ? (
          <p className='text-destructive text-xs font-medium'>{error}</p>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div
          className={cn(
            'rounded-md border border-dashed py-8 text-center text-xs font-medium',
            'bg-background/60 text-muted-foreground',
            error ? 'border-destructive/60' : 'border-border/70',
          )}
        >
          No expectation items available. Add a title and description to begin.
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
                  {row.title}
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
                  aria-label={`Remove expectation ${index + 1}`}
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

      <div className='grid grid-cols-1 gap-3'>
        <TextField
          label='Title'
          disabled={disabled}
          placeholder={
            locale === 'en'
              ? 'Enter expectation title'
              : 'မျှော်မှန်းချက်ခေါင်းစဉ်ကို ထည့်ပါ'
          }
          value={draftRow.title}
          onChange={(e) => {
            setDraftRow((prev) => ({ ...prev, title: e.target.value }));
            if (hasAttempted && e.target.value.trim()) setHasAttempted(false);
          }}
          error={draftTitleError}
        />
        <TextAreaField
          label='Description'
          disabled={disabled}
          placeholder={
            locale === 'en'
              ? 'Enter a description for this expectation'
              : 'ဤမျှော်မှန်းချက်အတွက် ဖော်ပြချက်ကို ထည့်ပါ'
          }
          value={draftRow.description}
          onChange={(e) =>
            setDraftRow((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={3}
          className='min-h-18'
          error={draftDescriptionError}
        />
      </div>

      <Button
        type='button'
        variant='outline'
        onClick={addRow}
        disabled={disabled}
        className='text-foreground bg-background hover:bg-muted h-10 w-full gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold md:h-12'
      >
        <PlusIcon className='size-3.5' />
        Add Expectation
      </Button>
    </div>
  );
}
