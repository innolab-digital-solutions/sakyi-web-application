'use client';

import { AlertCircle, Check, ChevronsUpDown, X } from 'lucide-react';
import * as React from 'react';

import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label as ShadCNLabel } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils/styles';

/** Option row for `SelectField` (plain labels; use `ComboBoxField` for search or rich rows). */
export type SelectFieldOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectFieldSharedProps = {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  /** Shown when no value is selected. */
  placeholder?: string;
  options: SelectFieldOption[];
  id?: string;
  /**
   * Submitted with native forms via hidden inputs (only when `onChange` is used so the value stays
   * in sync).
   */
  name?: string;
  className?: string;
};

export type SelectFieldSingleProps = SelectFieldSharedProps & {
  multiple?: false;
  /** Controlled value; `undefined` means no selection (placeholder). */
  value?: string;
  onChange?: (value: string | undefined) => void;
  /** Uncontrolled initial value. */
  defaultValue?: string;
};

export type SelectFieldMultiProps = SelectFieldSharedProps & {
  multiple: true;
  /** Controlled selected values (option `value`s). */
  value?: string[];
  onChange?: (value: string[]) => void;
};

export type SelectFieldProps = SelectFieldSingleProps | SelectFieldMultiProps;

/**
 * Dropdown using shadcn `Select` (single) or Popover + list (multi), with label and error
 * presentation aligned with `TextField` / `ComboBoxField`. Multi-select uses removable chips like
 * `ComboBoxField` multiple. For searchable lists, use `ComboBoxField`.
 */
const SelectField = React.forwardRef<
  React.ComponentRef<typeof SelectTrigger> | HTMLDivElement,
  SelectFieldProps
>((props, ref) => {
  if (props.multiple) {
    return (
      <SelectFieldMultiple
        {...props}
        ref={ref as React.Ref<HTMLDivElement>}
      />
    );
  }
  return (
    <SelectFieldSingle
      {...props}
      ref={ref as React.Ref<React.ComponentRef<typeof SelectTrigger>>}
    />
  );
});

SelectField.displayName = 'SelectField';

const SelectFieldSingle = React.forwardRef<
  React.ComponentRef<typeof SelectTrigger>,
  SelectFieldSingleProps
>(
  (
    {
      id: idProp,
      label,
      error,
      required,
      disabled,
      placeholder = 'Select…',
      options,
      value,
      onChange,
      defaultValue,
      name,
      className,
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const id = idProp ?? generatedId;
    const errorId = error ? `${id}-error` : undefined;

    const responsiveTriggerClass = cn(
      'inline-flex w-full min-w-0 cursor-pointer items-center justify-between rounded-md font-medium whitespace-normal outline-none',
      'border border-neutral-200 bg-transparent shadow-xs transition-[color,box-shadow]',
      'dark:bg-input/30',
      'text-xs h-10 py-1 px-3 md:h-12 md:px-4 md:text-sm',
      'data-[size=default]:h-10 md:data-[size=default]:h-12',
      'data-placeholder:text-muted-foreground',
      !error &&
        'hover:bg-transparent hover:text-foreground dark:hover:bg-input/30',
      error &&
        'border-destructive bg-destructive/4 hover:bg-destructive/5 hover:text-foreground dark:bg-destructive/15 dark:hover:bg-destructive/20',
      'focus-visible:ring-[3px]',
      !error && 'focus-visible:border-ring focus-visible:ring-ring/50',
      error && 'focus-visible:border-destructive focus-visible:ring-destructive/20',
      !error &&
        'data-[state=open]:border-ring data-[state=open]:ring-[3px] data-[state=open]:ring-ring/50',
      error &&
        'data-[state=open]:border-destructive data-[state=open]:ring-[3px] data-[state=open]:ring-destructive/20',
      disabled && 'pointer-events-none cursor-not-allowed opacity-50',
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

    const isControlled = onChange !== undefined;

    return (
      <div className={cn('space-y-2', className)}>
        {label ? (
          <ShadCNLabel htmlFor={id} className={responsiveLabelClass}>
            {label}
          </ShadCNLabel>
        ) : null}

        {name != null && isControlled ? (
          <input
            type='hidden'
            name={name}
            value={value ?? ''}
            readOnly
            aria-hidden
          />
        ) : null}

        <Select
          value={isControlled ? value : undefined}
          defaultValue={!isControlled ? defaultValue : undefined}
          onValueChange={(v) => onChange?.(v)}
          disabled={disabled}
          required={required}
        >
          <SelectTrigger
            ref={ref}
            id={id}
            className={responsiveTriggerClass}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent
            position='popper'
            align='start'
            className='border-input bg-popover max-h-60 min-w-(--radix-select-trigger-width) border shadow-xs'
          >
            {options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className='py-2 text-xs font-medium md:text-sm'
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {error ? (
          <p id={errorId} className={responsiveErrorClass} role='alert'>
            <AlertCircle className='h-4 w-4 shrink-0' />
            <span>{error}</span>
          </p>
        ) : null}
      </div>
    );
  },
);

SelectFieldSingle.displayName = 'SelectFieldSingle';

const SelectFieldMultiple = React.forwardRef<
  HTMLDivElement,
  SelectFieldMultiProps
>(
  (
    {
      id: idProp,
      label,
      error,
      required,
      disabled,
      placeholder = 'Select…',
      options,
      value,
      onChange,
      name,
      className,
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const id = idProp ?? generatedId;
    const listboxId = `${id}-listbox`;
    const errorId = error ? `${id}-error` : undefined;
    const [open, setOpen] = React.useState(false);

    const valueArr = value ?? [];
    const optionMap = React.useMemo(() => {
      const m = new Map<string, SelectFieldOption>();
      for (const o of options) m.set(o.value, o);
      return m;
    }, [options]);

    const hasSelection = valueArr.length > 0;

    const handleToggle = (opt: SelectFieldOption) => {
      if (opt.disabled) return;
      const exists = valueArr.includes(opt.value);
      const next = exists
        ? valueArr.filter((v) => v !== opt.value)
        : [...valueArr, opt.value];
      onChange?.(next);
    };

    const removeChip = (optionValue: string, e: React.SyntheticEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      onChange?.(valueArr.filter((v) => v !== optionValue));
    };

    const isOptionSelected = (optionValue: string) =>
      valueArr.includes(optionValue);

    const responsiveTriggerClass = cn(
      'inline-flex w-full min-w-0 cursor-pointer items-center justify-between rounded-md font-medium outline-none',
      'border border-neutral-200 bg-transparent shadow-xs transition-[color,box-shadow]',
      'dark:bg-input/30',
      'min-h-10 gap-2 py-1.5 text-xs md:min-h-12 md:text-sm',
      !error &&
        'hover:bg-transparent hover:text-foreground dark:hover:bg-input/30',
      error &&
        'border-destructive bg-destructive/4 hover:bg-destructive/5 hover:text-foreground dark:bg-destructive/15 dark:hover:bg-destructive/20',
      'focus-visible:ring-[3px]',
      !error && 'focus-visible:border-ring focus-visible:ring-ring/50',
      error && 'focus-visible:border-destructive focus-visible:ring-destructive/20',
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

    return (
      <div className={cn('space-y-2', className)}>
        {label ? (
          <ShadCNLabel htmlFor={id} className={responsiveLabelClass}>
            {label}
          </ShadCNLabel>
        ) : null}

        {name != null
          ? valueArr.map((v) => (
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

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div
              id={id}
              ref={ref}
              role='combobox'
              tabIndex={disabled ? -1 : 0}
              aria-expanded={open}
              aria-controls={listboxId}
              aria-haspopup='listbox'
              aria-invalid={error ? true : undefined}
              aria-describedby={errorId}
              aria-disabled={disabled ? true : undefined}
              className={cn(responsiveTriggerClass, 'px-2 md:px-3')}
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
                {hasSelection ? (
                  valueArr.map((v) => {
                    const opt = optionMap.get(v);
                    const chipLabel = opt?.label ?? v;
                    return (
                      <span
                        key={v}
                        className='bg-muted/70 text-foreground border-border inline-flex max-w-full min-w-0 items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium'
                      >
                        <span className='flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden'>
                          {chipLabel}
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
                )}
              </div>
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
            <Command
              shouldFilter={false}
              className='flex max-h-[min(420px,70vh)] flex-col overflow-hidden rounded-md'
            >
              <CommandList
                role='listbox'
                aria-multiselectable
                className='min-h-0 max-h-60 flex-1 overflow-y-auto overscroll-contain scroll-py-1'
              >
                <CommandGroup>
                  {options.map((opt) => (
                    <CommandItem
                      key={opt.value}
                      disabled={opt.disabled}
                      value={opt.value}
                      className={cn(
                        'items-start gap-2 py-2',
                        'data-[selected=true]:bg-muted/70 data-[selected=true]:text-foreground',
                      )}
                      onSelect={() => handleToggle(opt)}
                    >
                      <span className='flex w-full min-w-0 items-start gap-2'>
                        <span className='min-w-0 flex-1 text-left font-medium'>
                          {opt.label}
                        </span>
                        <Check
                          className={cn(
                            'mt-0.5 h-4 w-4 shrink-0',
                            isOptionSelected(opt.value)
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

        {error ? (
          <p id={errorId} className={responsiveErrorClass} role='alert'>
            <AlertCircle className='h-4 w-4 shrink-0' />
            <span>{error}</span>
          </p>
        ) : null}
      </div>
    );
  },
);

SelectFieldMultiple.displayName = 'SelectFieldMultiple';

export default SelectField;
