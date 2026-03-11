import * as React from 'react';

import { client } from '@/lib/api/client';

import { buildSubmitShortcuts } from './shortcuts';
import {
  ApiError,
  FormErrors,
  FormFields,
  FormOptions,
  FormSubmitOptions,
  HttpMethod,
  UseFormReturn,
} from './types';
import { deepClone, isEqual } from './utils';
import { validateFormFields } from './validator';

/**
 * React hook for managing robust form state, validation, errors, and HTTP submission.
 *
 * Provides a unified form state management system including field data, error handling, submission state,
 * dirty tracking, and default value management. Supports:
 *   - Controlled, partial, or full updates to form fields and defaults
 *   - Field-level and global error management
 *   - "Dirty" state detection (form has been modified)
 *   - Client-side validation via Zod schema (optional)
 *   - HTTP submission helpers for RESTful methods (using a shared API client)
 *   - Synchronous and asynchronous reset/cancel capabilities
 *
 * Returns form state and API for updating, resetting, validating, or submitting forms,
 * as described by the UseFormReturn type.
 *
 * @param {FormFields} initialFields - Initial values for each form field, or an empty object for dynamic forms.
 * @param {FormOptions} [options] - Optional configuration, e.g., a Zod schema for client-side validation.
 * @returns {UseFormReturn} The full typed API for managing and submitting the form.
 *
 * @example
 * const form = useForm({ email: '', password: '' }, { schema: loginSchema });
 * <input value={form.fields.email} onChange={e => form.setData('email', e.target.value)} />
 * <button onClick={() => form.post('/api/login', { onSuccess: ... })}>Login</button>
 */
export const useForm = (
  initialFields: FormFields,
  options: FormOptions = {},
): UseFormReturn => {
  const [fields, setFields] = React.useState<FormFields>(
    deepClone(initialFields),
  );
  const [defaults, setDefaultsState] = React.useState<FormFields>(
    deepClone(initialFields),
  );
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isDirty, setIsDirty] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const abortControllerRef = React.useRef<AbortController | null>(null);

  /**
   * Updates form data with new values or for a single field, optionally triggers dirty state detection.
   *
   * @template K - Field key type
   * @param {K | Partial<FormFields>} keyOrData - Field name to update, or a partial object of fields to update all at once
   * @param {FormFields[K]} [value] - Value to set (if updating a single field)
   *
   * @example
   * setData('email', 'test@example.com');
   * setData({ name: 'Alice', age: 30 });
   */
  const setData = React.useCallback(
    <K extends keyof FormFields>(
      keyOrData: K | Partial<FormFields>,
      value?: FormFields[K],
    ) => {
      setFields((prev) => {
        const next: FormFields =
          typeof keyOrData === 'string' && value !== undefined
            ? ({ ...prev, [keyOrData]: value } as FormFields)
            : ({
                ...prev,
                ...(keyOrData as Partial<FormFields>),
              } as FormFields);

        setIsDirty(!isEqual(next, defaults));
        return next;
      });
    },
    [defaults],
  );

  /**
   * Resets the form fields to their current defaults.
   * - If no field names provided, resets all fields.
   * - If specific field keys provided, resets only those fields.
   *
   * @param {...(keyof FormFields)[]} fieldsToReset - Optional field names to reset (resets all if omitted)
   *
   * @example
   * reset();
   * reset('email', 'password');
   */
  const reset = React.useCallback(
    (...fieldsToReset: (keyof FormFields)[]) => {
      if (fieldsToReset.length === 0) {
        setFields(defaults);
        setIsDirty(false);
        return;
      }
      setFields((prev) => {
        const next = { ...prev } as FormFields;
        for (const field of fieldsToReset) next[field] = defaults[field];
        return next;
      });
    },
    [defaults],
  );

  /**
   * Sets default field values in the form.
   * - If no argument, sets defaults to the current field values.
   * - If a field name and value is given, updates that default.
   * - If a partial object is given, updates multiple defaults.
   *
   * @param {keyof FormFields | Partial<FormFields>} [field] - Field name or partial object (optional)
   * @param {FormFields[keyof FormFields]} [value] - Value for a single field default (if applicable)
   *
   * @example
   * setDefaults();
   * setDefaults('email', 'test@example.com');
   * setDefaults({ name: 'Alice', age: 30 });
   */
  const setDefaults = React.useCallback(
    (
      field?: keyof FormFields | Partial<FormFields>,
      value?: FormFields[keyof FormFields],
    ) => {
      if (!field) {
        setDefaultsState(deepClone(fields));
        return;
      }
      if (typeof field === 'string') {
        setDefaultsState(
          (prev) =>
            ({
              ...deepClone(prev),
              [field]: deepClone(value),
            }) as FormFields,
        );
        return;
      }
      setDefaultsState(
        (prev) =>
          ({
            ...deepClone(prev),
            ...(deepClone(field) as Partial<FormFields>),
          }) as FormFields,
      );
    },
    [fields],
  );

  /**
   * Sets both fields and defaults with new data, and resets dirty state.
   *
   * @param {Partial<FormFields>} newData - Data to set for fields and defaults
   *
   * @example
   * setDataAndDefaults({ email: 'test@example.com', password: 'password' });
   */
  const setDataAndDefaults = React.useCallback(
    (newData: Partial<FormFields>) => {
      const cloned = deepClone(newData) as FormFields;
      setFields(cloned);
      setDefaultsState(deepClone(cloned));
      setIsDirty(false);
    },
    [],
  );

  /**
   * Sets one or more validation errors, either for a single field or using an error object.
   *
   * @param {keyof FormFields | string | FormErrors} field - Field name, global error key, or object of errors
   * @param {string} [message] - Error message (if setting a single field)
   *
   * @example
   * setError('email', 'Required');
   * setError({ email: 'Email is required', password: 'Password required' });
   */
  const setError = React.useCallback(
    (field: keyof FormFields | string | FormErrors, message?: string) => {
      if (typeof field === 'string' && message) {
        setErrors((prev) => ({ ...prev, [field]: message }));
        return;
      }
      setErrors((prev) => ({
        ...prev,
        ...(field as FormErrors),
      }));
    },
    [],
  );

  /**
   * Clears error messages for one or more fields, or all errors if none specified.
   *
   * @param {...(keyof FormFields | string)[]} fields - Field names or keys to clear errors for (clears all if omitted)
   *
   * @example
   * clearErrors();
   * clearErrors('email', 'password');
   */
  const clearErrors = React.useCallback(
    (...fields: (keyof FormFields | string)[]) => {
      if (fields.length === 0) {
        setErrors({});
        return;
      }
      setErrors((prev) => {
        const next = { ...prev };
        for (const field of fields) delete next[field];
        return next;
      });
    },
    [],
  );

  /**
   * Cancels (aborts) the current form submission request, if in flight, and sets isSubmitting to false.
   *
   * @example
   * cancel();
   */
  const cancel = React.useCallback(() => {
    abortControllerRef.current?.abort();
    setIsSubmitting(false);
  }, []);

  /**
   * Submits the form data to the specified URL using the provided HTTP method.
   *
   * Handles the following workflow:
   * - Clears prior errors.
   * - Optionally performs client-side validation using Zod, if a schema is configured.
   * - Sends an HTTP request using the provided method and current form fields as the request body
   *   (skips body for GET requests).
   * - Manages submission and dirty state, aborts ongoing requests via AbortController if canceled.
   * - Handles server-side errors, response errors, and invokes callback hooks for success, error, failure, or finish.
   *
   * @param {HttpMethod} method - The HTTP method to use (GET, POST, PUT, PATCH, DELETE, etc).
   * @param {string} url - The endpoint to submit the form data to.
   * @param {FormSubmitOptions} [submitOptions] - API for configuring callbacks:
   *   - onSuccess: called on successful response
   *   - onError: called on validation or server error (with error object)
   *   - onFailure: called on HTTP-level failure or when no errors are present
   *   - onFinish: always called at the end of submission
   *
   * @example
   * await submit('POST', '/api/users', {
   *   onSuccess: () => alert('User created!'),
   *   onError: (err) => setCustomError(err),
   *   onFinish: () => setLoading(false),
   * });
   */
  const submit = React.useCallback(
    async (
      method: HttpMethod,
      url: string,
      submitOptions?: FormSubmitOptions,
    ) => {
      const { onSuccess, onError, onFailure, onFinish } = submitOptions ?? {};
      setErrors({});

      // Perform client-side validation if schema exists
      if (options.schema) {
        const { success, errors: clientValidationErrors } = validateFormFields(
          options.schema,
          fields,
        );
        if (!success) {
          setErrors(clientValidationErrors);
          onError?.({
            status: 'error',
            message: 'Please review the fields and correct any issues.',
            errors: clientValidationErrors,
          });
          onFinish?.();
          return;
        }
      }

      setIsSubmitting(true);
      abortControllerRef.current = new AbortController();

      try {
        const body =
          method === 'GET'
            ? undefined
            : (fields as BodyInit | Record<string, unknown> | unknown[]);
        const signal = abortControllerRef.current?.signal;

        const response = await client<unknown>(url, {
          method,
          throwOnError: false,
          ...(body && { body }),
          ...(signal != null && { signal }),
        });

        if (response.status === 'error') {
          if (response.errors && Object.keys(response.errors).length > 0) {
            setErrors(response.errors as FormErrors);
            onError?.(response as ApiError);
          } else {
            onFailure?.(response as ApiError);
          }
        } else {
          onSuccess?.(response);
          setErrors({});
          setIsDirty(false);
        }
      } finally {
        setIsSubmitting(false);
        onFinish?.();
      }
    },
    [fields, options.schema],
  );

  return {
    fields,
    errors,
    isDirty,
    isSubmitting,
    reset,
    setDefaults,
    setData,
    setError,
    setDataAndDefaults,
    clearErrors,
    cancel,
    submit,
    ...buildSubmitShortcuts(submit),
  };
};
