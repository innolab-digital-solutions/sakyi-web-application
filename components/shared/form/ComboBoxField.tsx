'use client';

import { AlertCircle, Check, ChevronsUpDown, X } from 'lucide-react';
import * as React from 'react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label as ShadCNLabel } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils/styles';

/**
 * Combobox option: `value` / `label` are always required for filtering and fallbacks.
 * Use `content` for rich list rows (avatar, metadata, program cards, etc.).
 */
export type ComboboxOption = {
  /** Stable id (submitted via hidden inputs when `name` is set). */
  value: string;
  /**
   * Primary text: search/filter, default list row, chip, and single-select trigger when no overrides.
   */
  label: string;
  /** Extra strings to match in search (e.g. email, slug, id) — use when `label` alone is ambiguous. */
  keywords?: string[];
  disabled?: boolean;
  /**
   * Rich dropdown row. Defaults to `label` when omitted.
   * Keep related text in `label` / `keywords` so search still works.
   */
  content?: React.ReactNode;
  /**
   * Multi-select chip body when space is tight. Defaults to `label`.
   * Omit to use plain `label` text in chips.
   */
  chipContent?: React.ReactNode;
  /**
   * Single-select trigger when an option is chosen. Defaults to `label`.
   * Use for a compact summary when `content` is heavy.
   */
  selectedDisplay?: React.ReactNode;
};

type ComboboxFieldSharedProps = {
  /** Field label shown above the trigger. */
  label?: string;
  /** Validation or helper error; when set, styles the trigger as invalid and announces the message. */
  error?: string;
  /** Marks the field as required in the label (visual asterisk). */
  required?: boolean;
  /** Disables opening the list and selection. */
  disabled?: boolean;
  /** Shown when no option is selected. */
  placeholder?: string;
  /** Options to list and filter. */
  options: ComboboxOption[];
  /** Message when filtering yields no items. */
  emptyMessage?: string;
  /** Placeholder for the search input inside the popover. */
  searchPlaceholder?: string;
  id?: string;
  /**
   * Submitted with native forms via hidden inputs (the trigger is not a named control).
   * For `multiple`, one hidden input per selected value (use `name="field[]"` for array backends).
   */
  name?: string;
  className?: string;
};

export type ComboboxFieldSingleProps = ComboboxFieldSharedProps & {
  multiple?: false;
  /** When not `false` (default), single-select shows a clear control when a value is set. */
  clearable?: boolean;
  /** Controlled selected value (option `value`). */
  value?: string | null;
  /** Called when the selection changes (aligned with `TextField`’s `onChange` naming). */
  onChange?: (value: string | null) => void;
};

export type ComboboxFieldMultiProps = ComboboxFieldSharedProps & {
  multiple: true;
  /** Controlled selected values (option `value`s). */
  value?: string[];
  /** Called when the selection changes. */
  onChange?: (value: string[]) => void;
};

export type ComboboxFieldProps =
  | ComboboxFieldSingleProps
  | ComboboxFieldMultiProps;

/**
 * Searchable combobox built from shadcn Popover + Command, with label and error presentation matching TextField.
 *
 * Supports single or multi-select; multi-select shows removable chips in the trigger.
 */
function ComboboxField(props: ComboboxFieldProps) {
  const {
    label,
    error,
    required,
    disabled,
    placeholder = 'Select…',
    options,
    emptyMessage = 'No results found.',
    searchPlaceholder = 'Search…',
    id: idProp,
    name,
    className,
  } = props;

  const isMulti = props.multiple === true;
  const value = isMulti ? (props.value ?? []) : (props.value ?? null);
  const onChange = isMulti
    ? (props as ComboboxFieldMultiProps).onChange
    : (props as ComboboxFieldSingleProps).onChange;
  const clearableSingle =
    !isMulti && (props as ComboboxFieldSingleProps).clearable !== false;

  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const listboxId = `${id}-listbox`;
  const errorId = error ? `${id}-error` : undefined;
  const [open, setOpen] = React.useState(false);

  const optionMap = React.useMemo(() => {
    const m = new Map<string, ComboboxOption>();
    for (const o of options) m.set(o.value, o);
    return m;
  }, [options]);

  const selectedSingleOption =
    !isMulti && value !== null && value !== ''
      ? optionMap.get(value as string)
      : undefined;

  const hasSelection = isMulti
    ? (value as string[]).length > 0
    : (value as string | null) !== null && (value as string) !== '';

  const handleSelect = (option: ComboboxOption) => {
    if (option.disabled) return;

    if (isMulti) {
      const current = value as string[];
      const exists = current.includes(option.value);
      const next = exists
        ? current.filter((v) => v !== option.value)
        : [...current, option.value];
      (onChange as ComboboxFieldMultiProps['onChange'])?.(next);
      return;
    }

    const current = value as string | null;
    const next = current === option.value ? null : option.value;
    (onChange as ComboboxFieldSingleProps['onChange'])?.(next);
    setOpen(false);
  };

  const removeChip = (optionValue: string, e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isMulti || disabled) return;
    const current = value as string[];
    (onChange as ComboboxFieldMultiProps['onChange'])?.(
      current.filter((v) => v !== optionValue),
    );
  };

  const clearSingleSelection = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMulti || disabled || !onChange) return;
    (onChange as ComboboxFieldSingleProps['onChange'])?.(null);
  };

  const showSingleClear =
    !isMulti &&
    clearableSingle &&
    hasSelection &&
    !disabled &&
    onChange !== undefined;

  /**
   * Trigger styles mirror `components/ui/input.tsx` (used by TextField) so border, height, background,
   * and focus ring match text inputs. `variant="ghost"` avoids outline button defaults; we apply Input-like classes.
   */
  const responsiveTriggerClass = cn(
    'inline-flex w-full min-w-0 cursor-pointer items-center justify-between rounded-md font-medium outline-none',
    'border border-neutral-200 bg-transparent shadow-xs transition-[color,box-shadow]',
    'dark:bg-input/30',
    isMulti
      ? 'min-h-10 gap-2 py-1.5 text-xs md:min-h-12 md:text-sm'
      : 'text-xs h-10 py-1 md:h-12 md:text-sm',
    // Match TextField error surface; do not strip tint on hover (avoid hover:bg-transparent when invalid)
    !error &&
      'hover:bg-transparent hover:text-foreground dark:hover:bg-input/30',
    error &&
      'border-destructive bg-destructive/4 hover:bg-destructive/5 hover:text-foreground dark:bg-destructive/15 dark:hover:bg-destructive/20',
    'focus-visible:ring-[3px]',
    !error && 'focus-visible:border-ring focus-visible:ring-ring/50',
    error &&
      'focus-visible:border-destructive focus-visible:ring-destructive/20',
    open &&
      (error
        ? 'border-destructive ring-[3px] ring-destructive/20'
        : 'border-ring ring-[3px] ring-ring/50'),
    disabled && 'pointer-events-none cursor-not-allowed opacity-50',
    !hasSelection && 'text-muted-foreground',
  );

  const responsiveLabelClass = cn(
    'font-medium text-xs',
    'md:text-sm',
    required
      ? 'after:text-destructive after:ml-0.5 after:content-["*"]'
      : undefined,
  );

  const responsiveErrorClass = cn(
    'text-destructive flex items-center gap-2 font-medium text-xs',
    'md:text-sm',
  );

  const isOptionSelected = (optionValue: string) =>
    isMulti
      ? (value as string[]).includes(optionValue)
      : (value as string | null) === optionValue;

  const searchKeywordsFor = (option: ComboboxOption) =>
    [option.label, option.value, ...(option.keywords ?? [])].filter(Boolean);

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <ShadCNLabel htmlFor={id} className={responsiveLabelClass}>
          {label}
        </ShadCNLabel>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        {name != null && !isMulti ? (
          <input
            type='hidden'
            name={name}
            value={(value as string | null) ?? ''}
            readOnly
            aria-hidden
          />
        ) : null}
        {name != null && isMulti
          ? (value as string[]).map((v) => (
              <input
                key={v}
                type='hidden'
                name={name}
                value={v}
                readOnly
                aria-hidden
              />
            ))
          : null}
        <PopoverTrigger asChild>
          <div
            id={id}
            role='combobox'
            tabIndex={disabled ? -1 : 0}
            aria-expanded={open}
            aria-controls={listboxId}
            aria-haspopup='listbox'
            aria-autocomplete='list'
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            aria-disabled={disabled ? true : undefined}
            className={cn(
              responsiveTriggerClass,
              !isMulti && 'px-3 md:px-4',
              isMulti && 'px-2 md:px-3',
            )}
            onKeyDown={(e) => {
              if (disabled) return;
              if (e.target !== e.currentTarget) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setOpen((o) => !o);
              }
            }}
          >
            <div className='flex min-h-5 min-w-0 flex-1 flex-wrap items-center gap-1.5 text-left'>
              {isMulti ? (
                hasSelection ? (
                  (value as string[]).map((v) => {
                    const opt = optionMap.get(v);
                    const chipLabel = opt?.label ?? v;
                    const chipBody = opt?.chipContent ?? chipLabel;
                    return (
                      <span
                        key={v}
                        className='bg-muted/70 text-foreground border-border inline-flex max-w-full min-w-0 items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium'
                      >
                        <span className='flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden'>
                          {chipBody}
                        </span>
                        <button
                          type='button'
                          tabIndex={disabled ? -1 : 0}
                          className='text-muted-foreground hover:text-foreground focus-visible:ring-ring -mr-0.5 shrink-0 rounded-sm p-0.5 outline-none focus-visible:ring-2'
                          onClick={(e) => removeChip(v, e)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              removeChip(v, e);
                            }
                          }}
                          aria-label={`Remove ${chipLabel}`}
                        >
                          <X className='size-3.5' aria-hidden />
                        </button>
                      </span>
                    );
                  })
                ) : (
                  <span className='text-muted-foreground px-1'>
                    {placeholder}
                  </span>
                )
              ) : hasSelection ? (
                selectedSingleOption ? (
                  <span className='text-foreground flex min-w-0 flex-1 items-center gap-1.5 text-left'>
                    {selectedSingleOption.selectedDisplay ??
                      selectedSingleOption.label}
                  </span>
                ) : (
                  <span className='text-foreground truncate px-0'>
                    {String(value)}
                  </span>
                )
              ) : (
                <span className='text-muted-foreground px-1'>
                  {placeholder}
                </span>
              )}
            </div>
            {showSingleClear ? (
              <button
                type='button'
                tabIndex={disabled ? -1 : 0}
                className='text-muted-foreground hover:text-foreground focus-visible:ring-ring -mr-0.5 shrink-0 rounded-sm p-0.5 outline-none focus-visible:ring-2'
                onClick={clearSingleSelection}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    clearSingleSelection(e);
                  }
                }}
                aria-label='Clear selection'
              >
                <X className='size-3.5' aria-hidden />
              </button>
            ) : null}
            <ChevronsUpDown className='ml-1 h-4 w-4 shrink-0 opacity-50' />
          </div>
        </PopoverTrigger>
        <PopoverContent
          id={listboxId}
          className={cn(
            'w-(--radix-popover-trigger-width) p-0',
            'border-input bg-popover border shadow-xs',
          )}
          align='start'
        >
          <Command className='flex max-h-[min(420px,70vh)] flex-col overflow-hidden rounded-md'>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList
              role='listbox'
              aria-multiselectable={isMulti ? true : undefined}
              className='max-h-60 min-h-0 flex-1 scroll-py-1 overflow-y-auto overscroll-contain'
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    disabled={option.disabled}
                    value={`${option.value} ${searchKeywordsFor(option).join(' ')}`}
                    keywords={searchKeywordsFor(option)}
                    className={cn(
                      'items-start gap-2 py-2',
                      'data-[selected=true]:bg-muted/70 data-[selected=true]:text-foreground',
                    )}
                    onSelect={() => handleSelect(option)}
                  >
                    <span className='flex w-full min-w-0 items-start gap-2'>
                      <span className='min-w-0 flex-1 text-left font-medium'>
                        {option.content ?? option.label}
                      </span>
                      <Check
                        className={cn(
                          'mt-0.5 h-4 w-4 shrink-0',
                          isOptionSelected(option.value)
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                        aria-hidden
                      />
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && (
        <p id={errorId} className={responsiveErrorClass} role='alert'>
          <AlertCircle className='h-4 w-4' />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export default ComboboxField;
