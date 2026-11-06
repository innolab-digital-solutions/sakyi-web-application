'use client';

import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import * as React from 'react';

import { Input as ShadCNInput } from '@/components/ui/input';
import { Label as ShadCNLabel } from '@/components/ui/label';
import { cn } from '@/lib/utils/styles';

/**
 * Props for the TextField component. Extends the underlying input with optional label and error display.
 */
export type TextFieldVariant = 'default' | 'tableDense';

export type CustomInputProps = Omit<
  React.ComponentPropsWithoutRef<typeof ShadCNInput>,
  'aria-invalid' | 'aria-describedby'
> & {
  label?: string;
  error?: string;
  /**
   * `tableDense`: short flat inputs for data tables (smaller than summary row fields).
   */
  variant?: TextFieldVariant;
  /**
   * When `false`, password inputs render without the show/hide visibility control.
   * Defaults to `true` for backwards compatibility.
   */
  passwordVisibilityToggle?: boolean;
};

/**
 * Accessible form text input with optional label, error message, and optional password
 * visibility toggle (`passwordVisibilityToggle`, default true).
 *
 * Use for email, password, and single-line text fields in forms. Supports ref forwarding
 * and integrates with shared form state (e.g. useForm) via value, onChange, error, disabled.
 */
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
      variant = 'default',
      passwordVisibilityToggle = true,
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

    const isTableDense = variant === 'tableDense';
    const responsiveInputClass = cn(
      isTableDense
        ? // Page surface bg; no shadow; focus ring matches components/ui/input.tsx
          'h-[2.1875rem]! min-h-[2.1875rem]! w-full min-w-0 rounded-sm border! border-neutral-200! bg-background! px-2! py-0! text-xs! font-medium! leading-tight! tabular-nums! text-foreground! shadow-none! transition-[color,box-shadow] outline-none! focus-visible:border-ring! focus-visible:ring-[3px]! focus-visible:ring-ring/50! md:h-[2.1875rem]! md:min-h-[2.1875rem]! md:px-2! md:py-0! md:text-xs!'
        : 'text-xs h-10 px-3 font-medium border-neutral-200',
      !isTableDense && 'md:text-sm md:h-12 md:px-4',
      isPassword && passwordVisibilityToggle && 'pr-10',
      error &&
        'border-destructive bg-destructive/4 focus-visible:ring-destructive/20',
      className,
    );

    const responsiveLabelClass = cn(
      'font-medium text-xs',
      'md:text-[13px]',
      required
        ? 'after:text-destructive after:ml-0.5 after:content-["*"]'
        : undefined,
    );

    const responsiveErrorClass = cn(
      'text-destructive flex items-center gap-2 font-medium text-xs',
      'md:text-[13px]',
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
      <div className={isTableDense ? 'w-full space-y-0' : 'space-y-2'}>
        {label && (
          <ShadCNLabel htmlFor={id} className={responsiveLabelClass}>
            {label}
          </ShadCNLabel>
        )}
        {isPassword && passwordVisibilityToggle ? (
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
