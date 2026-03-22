'use client';

import {
  addDays,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
  subDays,
} from 'date-fns';
import { AlertCircle, CalendarIcon, ChevronDown } from 'lucide-react';
import * as React from 'react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label as ShadCNLabel } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils/styles';

export type { DateRange };

type DatePickerFieldSharedProps = {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
  /**
   * Quick-select chips above the calendar. When `true`, uses built-in presets for the active `mode`.
   */
  presets?: boolean;
  /**
   * When `true` (default), show a clear control so the user can remove the selection after choosing a date.
   */
  clearable?: boolean;
};

type CalendarPassthrough = Omit<
  React.ComponentProps<typeof Calendar>,
  'mode' | 'selected' | 'onSelect' | 'defaultMonth'
>;

export type DatePickerFieldSingleProps = DatePickerFieldSharedProps & {
  mode?: 'single';
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  dateFormat?: string;
  /** Native form: date `yyyy-MM-dd`, or `yyyy-MM-dd'T'HH:mm` when `includeTime` is true. */
  name?: string;
  /** Show a time field (single mode only). */
  includeTime?: boolean;
  calendarProps?: CalendarPassthrough;
};

export type DatePickerFieldRangeProps = DatePickerFieldSharedProps & {
  mode: 'range';
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  dateFormat?: string;
  /** Hidden inputs for range endpoints (`yyyy-MM-dd`). */
  nameFrom?: string;
  nameTo?: string;
  calendarProps?: CalendarPassthrough;
};

export type DatePickerFieldProps =
  | DatePickerFieldSingleProps
  | DatePickerFieldRangeProps;

const DEFAULT_TIME = '09:00';

function parseTimeToDate(base: Date, hm: string): Date {
  const [h, m] = hm.split(':').map((x) => parseInt(x, 10));
  const next = new Date(base);
  next.setHours(Number.isFinite(h) ? h : 0, Number.isFinite(m) ? m : 0, 0, 0);
  return next;
}

function timeValueFromDate(d: Date | undefined): string {
  if (!d) return DEFAULT_TIME;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function defaultSinglePresets(): { label: string; getDate: () => Date }[] {
  const today = startOfDay(new Date());
  return [
    { label: 'Today', getDate: () => today },
    { label: 'Tomorrow', getDate: () => addDays(today, 1) },
    { label: 'In 1 week', getDate: () => addDays(today, 7) },
  ];
}

function defaultRangePresets(): { label: string; getRange: () => DateRange }[] {
  const today = startOfDay(new Date());
  return [
    {
      label: 'Last 7 days',
      getRange: () => ({ from: subDays(today, 6), to: today }),
    },
    {
      label: 'This month',
      getRange: () => ({
        from: startOfMonth(today),
        to: endOfMonth(today),
      }),
    },
  ];
}

function formatRangeTrigger(
  range: DateRange | undefined,
  dateFormat: string,
): string {
  if (!range?.from) return '';
  if (!range.to) return `${format(range.from, dateFormat)} – …`;
  return `${format(range.from, dateFormat)} – ${format(range.to, dateFormat)}`;
}

/**
 * Date or date-range picker (shadcn `Calendar` + `Popover`) with label and error styling aligned with
 * `TextField` / `ComboBoxField`. Optional presets, time (single mode), and clear when `clearable` is
 * true. Calendar day colors use `sidebar` tokens so selected days match the admin sidebar.
 */
function DatePickerField(props: DatePickerFieldProps) {
  const isRange = props.mode === 'range';

  const {
    label,
    error,
    required,
    disabled,
    placeholder = isRange ? 'Select a date range…' : 'Pick a date',
    id: idProp,
    className,
    presets: showPresets = false,
    clearable = true,
  } = props;

  const dateFormat =
    (props as DatePickerFieldSingleProps | DatePickerFieldRangeProps)
      .dateFormat ?? 'PP';

  const calendarProps = isRange
    ? (props as DatePickerFieldRangeProps).calendarProps
    : (props as DatePickerFieldSingleProps).calendarProps;

  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const errorId = error ? `${id}-error` : undefined;
  const [open, setOpen] = React.useState(false);

  const includeTime =
    !isRange && (props as DatePickerFieldSingleProps).includeTime;
  const singleValue = !isRange
    ? (props as DatePickerFieldSingleProps).value
    : undefined;
  const rangeValue = isRange
    ? (props as DatePickerFieldRangeProps).value
    : undefined;

  const [timeStr, setTimeStr] = React.useState(() =>
    singleValue ? timeValueFromDate(singleValue) : DEFAULT_TIME,
  );

  React.useEffect(() => {
    if (isRange || !includeTime) return;
    if (singleValue) setTimeStr(timeValueFromDate(singleValue));
  }, [isRange, includeTime, singleValue]);

  const responsiveTriggerClass = cn(
    'inline-flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-md font-medium outline-none',
    'border border-neutral-200 bg-transparent shadow-xs transition-[color,box-shadow]',
    'dark:bg-input/30',
    'text-xs h-10 px-3 py-1 md:h-12 md:px-4 md:text-sm',
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

  const hasValue = isRange ? Boolean(rangeValue?.from) : Boolean(singleValue);

  const triggerClass = cn(
    responsiveTriggerClass,
    !hasValue && 'text-muted-foreground',
  );

  let triggerLabel = '';
  if (isRange) {
    triggerLabel = formatRangeTrigger(rangeValue, dateFormat);
  } else if (singleValue) {
    triggerLabel = includeTime
      ? `${format(singleValue, dateFormat)} · ${format(singleValue, 'p')}`
      : format(singleValue, dateFormat);
  }

  const presetRow = showPresets ? (
    <div className='border-border flex flex-wrap gap-1.5 border-b px-2 py-2'>
      {isRange
        ? defaultRangePresets().map((p) => (
            <button
              key={p.label}
              type='button'
              className='bg-background text-foreground hover:bg-muted/80 border-border rounded-md border px-2 py-1 text-xs font-medium'
              onClick={() => {
                const range = p.getRange();
                (props as DatePickerFieldRangeProps).onChange?.(range);
                setOpen(false);
              }}
            >
              {p.label}
            </button>
          ))
        : defaultSinglePresets().map((p) => (
            <button
              key={p.label}
              type='button'
              className='bg-background text-foreground hover:bg-muted/80 border-border rounded-md border px-2 py-1 text-xs font-medium'
              onClick={() => {
                let d = p.getDate();
                if (includeTime) d = parseTimeToDate(d, timeStr);
                (props as DatePickerFieldSingleProps).onChange?.(d);
                setOpen(false);
              }}
            >
              {p.label}
            </button>
          ))}
    </div>
  ) : null;

  const hiddenSingle = !isRange
    ? (props as DatePickerFieldSingleProps).name
    : undefined;
  const hiddenRangeFrom = isRange
    ? (props as DatePickerFieldRangeProps).nameFrom
    : undefined;
  const hiddenRangeTo = isRange
    ? (props as DatePickerFieldRangeProps).nameTo
    : undefined;

  const hiddenSingleValue =
    singleValue && includeTime
      ? format(singleValue, "yyyy-MM-dd'T'HH:mm")
      : singleValue
        ? format(singleValue, 'yyyy-MM-dd')
        : '';

  const showClear = clearable && !disabled && hasValue;

  const clearSelection = () => {
    if (isRange) {
      (props as DatePickerFieldRangeProps).onChange?.(undefined);
    } else {
      (props as DatePickerFieldSingleProps).onChange?.(undefined);
      setTimeStr(DEFAULT_TIME);
    }
    setOpen(false);
  };

  const clearFooter = showClear ? (
    <div className='border-border flex justify-end border-t px-2 py-1'>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        className='text-muted-foreground hover:text-foreground h-8 px-2 text-xs font-medium'
        onClick={clearSelection}
      >
        Clear selection
      </Button>
    </div>
  ) : null;

  return (
    <div className={cn('space-y-2', className)}>
      {label ? (
        <ShadCNLabel htmlFor={id} className={responsiveLabelClass}>
          {label}
        </ShadCNLabel>
      ) : null}

      <Popover open={open} onOpenChange={setOpen}>
        {hiddenSingle != null ? (
          <input
            type='hidden'
            name={hiddenSingle}
            value={hiddenSingleValue}
            readOnly
            aria-hidden
          />
        ) : null}
        {hiddenRangeFrom != null ? (
          <input
            type='hidden'
            name={hiddenRangeFrom}
            value={
              rangeValue?.from ? format(rangeValue.from, 'yyyy-MM-dd') : ''
            }
            readOnly
            aria-hidden
          />
        ) : null}
        {hiddenRangeTo != null ? (
          <input
            type='hidden'
            name={hiddenRangeTo}
            value={rangeValue?.to ? format(rangeValue.to, 'yyyy-MM-dd') : ''}
            readOnly
            aria-hidden
          />
        ) : null}

        <PopoverTrigger asChild>
          <button
            id={id}
            type='button'
            disabled={disabled}
            aria-expanded={open}
            aria-haspopup='dialog'
            aria-describedby={errorId}
            className={triggerClass}
          >
            <span className='flex min-w-0 flex-1 items-center gap-2 text-left'>
              <CalendarIcon
                className='size-4 shrink-0 opacity-70'
                aria-hidden
              />
              <span className='min-w-0 flex-1 truncate'>
                {hasValue ? triggerLabel : placeholder}
              </span>
            </span>
            <ChevronDown className='size-4 shrink-0 opacity-50' aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className='border-input bg-popover w-auto border p-0 shadow-xs'
          align='start'
        >
          {presetRow}
          {isRange ? (
            <>
              <Calendar
                {...calendarProps}
                mode='range'
                selected={rangeValue}
                onSelect={(range: DateRange | undefined) => {
                  (props as DatePickerFieldRangeProps).onChange?.(range);
                  if (range?.from && range.to) setOpen(false);
                }}
                initialFocus
              />
              {clearFooter}
            </>
          ) : (
            <>
              <Calendar
                {...calendarProps}
                mode='single'
                selected={singleValue}
                onSelect={(date: Date | undefined) => {
                  if (!date) {
                    (props as DatePickerFieldSingleProps).onChange?.(undefined);
                    setOpen(false);
                    return;
                  }
                  const next = includeTime
                    ? parseTimeToDate(date, timeStr)
                    : date;
                  (props as DatePickerFieldSingleProps).onChange?.(next);
                  setOpen(false);
                }}
                initialFocus
              />
              {includeTime ? (
                <div className='border-border flex items-center gap-2 border-t px-3 py-2'>
                  <ShadCNLabel
                    htmlFor={`${id}-time`}
                    className='text-muted-foreground w-14 shrink-0 text-xs font-medium'
                  >
                    Time
                  </ShadCNLabel>
                  <Input
                    id={`${id}-time`}
                    type='time'
                    step={60}
                    disabled={disabled}
                    className='h-9 max-w-36 text-sm'
                    value={timeStr}
                    onChange={(e) => {
                      const nextHm = e.target.value || DEFAULT_TIME;
                      setTimeStr(nextHm);
                      if (!singleValue) return;
                      (props as DatePickerFieldSingleProps).onChange?.(
                        parseTimeToDate(singleValue, nextHm),
                      );
                    }}
                  />
                </div>
              ) : null}
              {clearFooter}
            </>
          )}
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
}

export default DatePickerField;
