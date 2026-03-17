'use client';

import { AlertCircle } from 'lucide-react';
import * as React from 'react';

import { Label as ShadCNLabel } from '@/components/ui/label';
import { Textarea as ShadCNTextarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils/styles';

export type TextareaFieldProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    error?: string;
  };

const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
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

    return (
      <div className='space-y-2'>
        {label && (
          <ShadCNLabel
            htmlFor={id}
            className={cn(
              'text-xs font-medium md:text-sm',
              required
                ? 'after:text-destructive after:ml-0.5 after:content-["*"]'
                : undefined,
            )}
          >
            {label}
          </ShadCNLabel>
        )}
        <ShadCNTextarea
          {...rest}
          id={id}
          name={name}
          ref={ref}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(
            'resize-none px-3 text-xs font-medium md:px-4 md:text-sm',
            error && 'border-destructive focus-visible:ring-destructive/20',
            className,
          )}
        />
        {error && (
          <p
            id={errorId}
            className='text-destructive flex items-center gap-2 text-xs font-medium md:text-sm'
            role='alert'
          >
            <AlertCircle className='h-4 w-4' />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  },
);

TextareaField.displayName = 'TextareaField';

export default TextareaField;
