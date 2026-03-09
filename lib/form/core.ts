import * as React from 'react';

import { isEqual } from '@/hooks/form/utils';
import { client } from '@/lib/api/client';

import { buildSubmitShortcuts } from './shortcuts';
import {
  ApiError,
  FormErrors,
  FormFields,
  FormOptions,
  FormSubmitOptions,
  HttpMethod,
} from './types';
import { deepClone } from './utils';
import { validateFormFields } from './validator';

export const useForm = (
  initialFields: FormFields,
  options: FormOptions = {},
) => {
  const [fields, setFieldsState] = React.useState<FormFields>(
    deepClone(initialFields),
  );
  const [defaults, setDefaultsState] = React.useState<FormFields>(
    deepClone(initialFields),
  );
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isDirty, setIsDirty] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const abortControllerRef = React.useRef<AbortController | null>(null);

  const setFields = React.useCallback(
    <K extends keyof FormFields>(
      keyOrData: K | Partial<FormFields>,
      value?: FormFields[K],
    ) => {
      setFieldsState((prev) => {
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

  const reset = React.useCallback(
    (...fieldsToReset: (keyof FormFields)[]) => {
      if (fieldsToReset.length === 0) {
        setFieldsState(defaults);
        setIsDirty(false);
        return;
      }
      setFieldsState((prev) => {
        const next = { ...prev } as FormFields;
        for (const field of fieldsToReset) next[field] = defaults[field];
        return next;
      });
    },
    [defaults],
  );

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

  const setDataAndDefaults = React.useCallback(
    (newData: Partial<FormFields>) => {
      const cloned = deepClone(newData) as FormFields;
      setFieldsState(cloned);
      setDefaultsState(deepClone(cloned));
      setIsDirty(false);
    },
    [],
  );

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

  const cancel = React.useCallback(() => {
    abortControllerRef.current?.abort();
    setIsSubmitting(false);
  }, []);

  const submit = React.useCallback(
    async (
      method: HttpMethod,
      url: string,
      submitOptions: FormSubmitOptions = {},
    ) => {
      const { onSuccess, onError, onFailure, onFinish } = submitOptions;
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
    setFields,
    setError,
    setDataAndDefaults,
    clearErrors,
    cancel,
    submit,
    ...buildSubmitShortcuts(submit),
  };
};
