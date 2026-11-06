import { type ZodType } from 'zod';

import type {
  ApiError,
  ApiResponse,
  ApiSuccess,
  HttpMethod,
} from '@/types/api';

export type { ApiError, ApiResponse, ApiSuccess, HttpMethod };

/**
 * Represents the key–value structure of form input fields.
 * Each field name maps to its associated value.
 *
 * @example
 * {
 *   email: 'test@example.com',
 *   password: 'secret123'
 * }
 */
export type FormFields = Record<string, unknown>;

/**
 * Configuration options for form initialization.
 *
 * @property {ZodType} [schema] - Optional Zod schema for form validation.
 */
export type FormOptions = {
  schema?: ZodType;
};

/**
 * Maps field names to error messages. Supports both fields defined in the schema
 * and arbitrary paths for nested or dynamic form fields.
 *
 * @example
 * {
 *   email: "Email is required",
 *   'address.street': "Street address is required"
 * }
 */
export type FormErrors = Partial<Record<keyof FormFields | string, string>>;

/**
 * Callbacks and hooks for customizing form submission behavior.
 *
 * @template TResponse - Type of the expected successful API response.
 * @property {function} [onSuccess] - Invoked when the request succeeds.
 * @property {function} [onError] - Invoked for validation or logical errors returned by the server.
 * @property {function} [onFailure] - Invoked when the request fails to complete or hits a network/server error.
 * @property {function} [onFinish] - Invoked after any form submission completes (success or error).
 */
export type FormSubmitOptions = {
  onSuccess?: (response: ApiResponse<unknown>) => void;
  onError?: (error: ApiError) => void;
  onFailure?: (error: ApiError) => void;
  onFinish?: () => void;
};

/**
 * Form submit function for performing HTTP requests with form data.
 *
 * @param {HttpMethod} method - The HTTP method to use (e.g., 'GET', 'POST', 'PUT', 'PATCH').
 * @param {string} url - The API endpoint or resource URL.
 * @param {FormSubmitOptions} [options] - Optional submit configuration, including callbacks for success, error, failure, and finish.
 * @returns {Promise<void>} Promise that resolves when the submission completes, regardless of success or error.
 */
export type FormSubmitFunction = (
  method: HttpMethod,
  url: string,
  options?: FormSubmitOptions,
) => Promise<void>;

export type UseFormReturn = {
  fields: FormFields;
  errors: FormErrors;
  isDirty: boolean;
  isSubmitting: boolean;
  reset: (...fieldsToReset: (keyof FormFields)[]) => void;
  setDefaults: (
    field?: keyof FormFields | Partial<FormFields>,
    value?: FormFields[keyof FormFields],
  ) => void;
  setData: <K extends keyof FormFields>(
    keyOrData: K | Partial<FormFields>,
    value?: FormFields[K],
  ) => void;
  setError: (
    field: keyof FormFields | string | FormErrors,
    message?: string,
  ) => void;
  setDataAndDefaults: (newData: Partial<FormFields>) => void;
  clearErrors: (...fields: (keyof FormFields | string)[]) => void;
  cancel: () => void;
  submit: FormSubmitFunction;
  get: (url: string, options?: FormSubmitOptions) => Promise<void>;
  post: (url: string, options?: FormSubmitOptions) => Promise<void>;
  put: (url: string, options?: FormSubmitOptions) => Promise<void>;
  patch: (url: string, options?: FormSubmitOptions) => Promise<void>;
  destroy: (url: string, options?: FormSubmitOptions) => Promise<void>;
};
