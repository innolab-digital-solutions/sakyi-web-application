import { useCallback, useRef, useState } from 'react';
import { ZodType } from 'zod';

import { submitRequest, type HttpMethod } from '@/services/form';
import type { ApiError, ApiResponse } from '@/types/api';

import { buildSubmitShortcuts, buildTransformChain } from './builders';
import {
  FormData,
  FormErrors,
  InternalSubmitOptions,
  UseFormOptions,
  UseFormReturn,
} from './types';
import { deepClone, isEqual } from './utils';
import { validate } from './validation';

/**
 * Inertia.js-style form state management hook with Zod validation.
 *
 * This hook provides comprehensive form handling with a convenient API
 * similar to Inertia.js v1 useForm. It manages form state, validation,
 * submission, and error handling.
 *
 * **Features:**
 * - Zod schema validation with field-level errors
 * - Dirty state tracking for unsaved changes
 * - Request cancellation support
 * - Chainable transform method for data transformation
 * - HTTP method shortcuts (get, post, put, patch, destroy)
 *
 * @template TSchema - Zod schema type for validation
 * @param initial - Initial form data values
 * @param options - Form configuration options
 * @returns Form state, handlers, HTTP method shortcuts, and transform builder
 */
export const useForm = <TSchema extends ZodType>(
  initial: FormData<TSchema>,
  options: UseFormOptions<TSchema> = {},
): UseFormReturn<TSchema> => {
  const [data, setDataState] = useState<FormData<TSchema>>(deepClone(initial));
  const [defaults, setDefaultsState] = useState<FormData<TSchema>>(
    deepClone(initial),
  );
  const [errors, setErrors] = useState<FormErrors<FormData<TSchema>>>({});
  const [processing, setProcessing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // Data Manipulation
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Update form field values.
   * Automatically tracks dirty state by comparing with defaults.
   */
  const setData = useCallback(
    <K extends keyof FormData<TSchema>>(
      keyOrData: K | Partial<FormData<TSchema>>,
      value?: FormData<TSchema>[K],
    ) => {
      setDataState((prev) => {
        const next: FormData<TSchema> =
          typeof keyOrData === 'string' && value !== undefined
            ? ({ ...prev, [keyOrData]: value } as FormData<TSchema>)
            : ({
                ...prev,
                ...(keyOrData as Partial<FormData<TSchema>>),
              } as FormData<TSchema>);

        setIsDirty(!isEqual(next, defaults));
        return next;
      });
    },
    [defaults],
  ) as UseFormReturn<TSchema>['setData'];

  /**
   * Reset form fields to default values.
   * Clears all errors when reset is called.
   */
  const reset = useCallback(
    (...fields: (keyof FormData<TSchema>)[]) => {
      if (fields.length === 0) {
        setDataState(defaults);
        setIsDirty(false);
      } else {
        setDataState((prev) => {
          const next = { ...prev } as FormData<TSchema>;
          for (const field of fields) next[field] = defaults[field];
          return next;
        });
      }
      setErrors({});
    },
    [defaults],
  );

  /**
   * Update default values for form fields.
   * Useful after successful submission or when loading existing data.
   */
  const setDefaults = useCallback(
    (
      field?: keyof FormData<TSchema> | Partial<FormData<TSchema>>,
      value?: FormData<TSchema>[keyof FormData<TSchema>],
    ) => {
      if (!field) {
        setDefaultsState(deepClone(data));
      } else if (typeof field === 'string') {
        setDefaultsState(
          (prev) =>
            ({
              ...deepClone(prev),
              [field]: deepClone(value),
            }) as FormData<TSchema>,
        );
      } else {
        setDefaultsState(
          (prev) =>
            ({
              ...deepClone(prev),
              ...(deepClone(field) as Partial<FormData<TSchema>>),
            }) as FormData<TSchema>,
        );
      }
    },
    [data],
  ) as UseFormReturn<TSchema>['setDefaults'];

  /**
   * Set both data and defaults atomically.
   * Prevents dirty state calculation issues when initializing forms.
   */
  const setDataAndDefaults = useCallback(
    (newData: Partial<FormData<TSchema>>) => {
      const cloned = deepClone(newData) as FormData<TSchema>;
      setDataState(cloned);
      setDefaultsState(deepClone(cloned));
      setIsDirty(false);
    },
    [],
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Error Handling
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Set validation errors for form fields.
   * Supports single field or multiple errors at once.
   */
  const setError = useCallback(
    (
      field: keyof FormData<TSchema> | string | FormErrors<FormData<TSchema>>,
      message?: string,
    ) => {
      if (typeof field === 'string' && message) {
        setErrors((prev) => ({ ...prev, [field]: message }));
      } else {
        setErrors((prev) => ({
          ...prev,
          ...(field as FormErrors<FormData<TSchema>>),
        }));
      }
    },
    [],
  ) as UseFormReturn<TSchema>['setError'];

  /**
   * Clear validation errors.
   * Clears all errors if no fields specified.
   */
  const clearErrors = useCallback(
    (...fields: (keyof FormData<TSchema> | string)[]) => {
      if (fields.length === 0) {
        setErrors({});
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          for (const field of fields) delete next[field];
          return next;
        });
      }
    },
    [],
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Request Control
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Cancel the current form submission.
   * Aborts the request and resets processing state.
   */
  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setProcessing(false);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // Form Submission
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Core submit method that handles validation and request lifecycle.
   *
   * @template TResponse - Expected response data type
   * @param method - HTTP method to use
   * @param url - API endpoint URL
   * @param submitOptions - Submission callbacks and options
   */
  const submit = useCallback(
    async <TResponse = unknown>(
      method: HttpMethod,
      url: string,
      submitOptions: InternalSubmitOptions<TResponse, TSchema> = {},
    ) => {
      const {
        onSuccess,
        onError,
        onFailure,
        onFinish,
        transform: transformFn,
      } = submitOptions;

      clearErrors();

      // Run frontend validation if schema is provided
      if (options.schema) {
        const { success, errors: validationErrors } = validate(
          options.schema,
          data,
        );
        if (!success) {
          setErrors(validationErrors);
          return;
        }
      }

      setProcessing(true);
      abortControllerRef.current = new AbortController();

      try {
        // Apply transform if provided, otherwise use raw data
        const payload = transformFn
          ? (transformFn(data) as
              | BodyInit
              | Record<string, unknown>
              | unknown[])
          : (data as BodyInit | Record<string, unknown> | unknown[]);

        const signal = abortControllerRef.current?.signal;
        const body =
          method !== 'GET'
            ? (payload as BodyInit | Record<string, unknown> | unknown[])
            : undefined;
        const response = await submitRequest<TResponse>(method, url, body, {
          throwOnError: false,
          ...(signal != null && { signal }),
        });

        if (response.status === 'error') {
          const errorResponse = response as ApiError;

          const fieldErrors =
            (errorResponse.errors as Record<string, unknown> | undefined) ?? {};
          const hasFieldErrors =
            fieldErrors &&
            typeof fieldErrors === 'object' &&
            Object.keys(fieldErrors).length > 0;

          // Treat responses with an errors map as validation errors; others as system failures
          if (hasFieldErrors) {
            setErrors(fieldErrors as FormErrors<FormData<TSchema>>);
            onError?.(errorResponse);
          } else {
            onFailure?.(errorResponse);
          }
        } else {
          onSuccess?.(response);
          setErrors({});
          setIsDirty(false);
        }
      } finally {
        setProcessing(false);
        onFinish?.();
      }
    },
    [data, options.schema, clearErrors],
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // HTTP Methods & Transform
  // ─────────────────────────────────────────────────────────────────────────────

  const { get, post, put, patch, destroy } = buildSubmitShortcuts(submit);

  /**
   * Create a chainable transform builder.
   * Returns HTTP method shortcuts that apply the transform before submission.
   */
  const transform = useCallback(
    (transformFn: Parameters<UseFormReturn<TSchema>['transform']>[0]) =>
      buildTransformChain(submit, transformFn),
    [submit],
  );

  return {
    data,
    errors,
    isDirty,
    processing,
    setData,
    reset,
    setDefaults,
    setDataAndDefaults,
    setError,
    clearErrors,
    cancel,
    submit,
    get,
    post,
    put,
    patch,
    destroy,
    transform,
  };
};
