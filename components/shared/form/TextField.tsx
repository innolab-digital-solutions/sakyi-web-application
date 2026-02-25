'use client';

import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import * as React from 'react';

import { Input as ShadCNInput } from '@/components/ui/input';
import { Label as ShadCNLabel } from '@/components/ui/label';
import { cn } from '@/lib/utils/common';

export type CustomInputProps = Omit<
  React.ComponentPropsWithoutRef<typeof ShadCNInput>,
  'aria-invalid' | 'aria-describedby'
> & {
  label?: string;
  error?: string;
};

const TextField = React.forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      id: idProp,
      name,
      type = 'text',
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
    const isPassword = type === 'password';
    const [showPassword, setShowPassword] = React.useState(false);
    const inputType = isPassword && showPassword ? 'text' : type;

    const responsiveInputClass = cn(
      'text-xs h-10 px-3 font-medium',
      'md:text-sm md:h-12 md:px-4',
      isPassword && 'pr-10',
      error && 'border-destructive focus-visible:ring-destructive/20',
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

    const inputProps = {
      ...rest,
      id,
      name,
      type: inputType,
      disabled,
      placeholder,
      ref,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': errorId,
      className: responsiveInputClass,
    };

    const inputElement = <ShadCNInput {...inputProps} />;

    return (
      <div className='space-y-2'>
        {label && (
          <ShadCNLabel htmlFor={id} className={responsiveLabelClass}>
            {label}
          </ShadCNLabel>
        )}
        {isPassword ? (
          <div className='relative'>
            {inputElement}
            <button
              type='button'
              className='text-muted-foreground hover:text-foreground absolute top-0 right-0 h-full cursor-pointer px-3'
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              disabled={disabled}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          </div>
        ) : (
          inputElement
        )}
        {error && (
          <p id={errorId} className={responsiveErrorClass} role='alert'>
            <AlertCircle className='h-4 w-4' />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  },
);

TextField.displayName = 'TextField';

export default TextField;
