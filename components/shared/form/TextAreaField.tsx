'use client';

import { AlertCircle } from 'lucide-react';
import * as React from 'react';

import { Label as ShadCNLabel } from '@/components/ui/label';
import { Textarea as ShadCNTextarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils/styles';

/**
 * Props for `TextAreaField`. Extends the underlying textarea with optional label and error display.
 */
export type TextAreaFieldProps = Omit<
  React.ComponentPropsWithoutRef<typeof ShadCNTextarea>,
  'aria-invalid' | 'aria-describedby'
> & {
  label?: string;
  error?: string;
};

/**
 * Multi-line text control with optional label and error message, aligned with `TextField` / `ComboBoxField`.
 *
 * Use for descriptions, notes, and long-form copy. Supports ref forwarding and controlled usage via
 * `value`, `onChange`, `error`, and `disabled`.
 */
const TextAreaField = React.forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  (
    {
      id: idProp,
      name,
      label,
      error,
      required,
      disabled,
      className,
      placeholder,
      ...rest
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const id = idProp ?? generatedId;
    const errorId = error ? `${id}-error` : undefined;

    const responsiveTextareaClass = cn(
      'w-full resize-y rounded-md border font-medium shadow-xs transition-[color,box-shadow] outline-none',
      'border-neutral-200 bg-transparent',
      'text-xs px-3 py-2.5 md:px-4 md:py-3 md:text-sm',
      'min-h-24',
      'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'placeholder:text-muted-foreground',
      error &&
        'border-destructive bg-destructive/4 focus-visible:ring-destructive/20',
      className,
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
      <div className='space-y-2'>
        {label ? (
          <ShadCNLabel htmlFor={id} className={responsiveLabelClass}>
            {label}
          </ShadCNLabel>
        ) : null}
        <ShadCNTextarea
          {...rest}
          id={id}
          name={name}
          ref={ref}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={responsiveTextareaClass}
        />
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

TextAreaField.displayName = 'TextAreaField';

export default TextAreaField;
