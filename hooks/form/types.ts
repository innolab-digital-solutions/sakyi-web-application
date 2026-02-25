import { z,ZodType } from 'zod';

import { ApiError, ApiResponse, HttpMethod } from '@/lib/api/client/types';

/**
 * Inferred form data type from Zod schema with index signature.
 *
 * @template TSchema - Zod schema type
 */
export type FormData<TSchema extends ZodType> = z.infer<TSchema> &
  Record<string, unknown>;

/**
 * Form field errors mapped by field name.
 * Supports both schema-defined keys and arbitrary string keys for nested paths.
 *
 * @template T - Form data type
 */
export type FormErrors<T> = Partial<Record<keyof T | string, string>>;

/**
 * Transform function type for modifying form data before submission.
 *
 * @template TSchema - Zod schema type
 */
export type TransformFn<TSchema extends ZodType> = (
  data: FormData<TSchema>,
) => FormData<TSchema> | BodyInit | Record<string, unknown> | unknown[];

/**
 * Submission callback options for form requests.
 *
 * @template TResponse - Expected API response data type
 */
export interface SubmitOptions<TResponse = unknown> {
  /**
   * Called when the request completes successfully.
   *
   * @param response - Successful API response with data
   */
  onSuccess?: (response: ApiResponse<TResponse>) => void;

  /**
   * Called when the server returns validation errors (category: "validation").
   * Field errors are automatically set before this callback is invoked.
   *
   * @param error - API error response with validation errors
   */
  onError?: (error: ApiError) => void;

  /**
   * Called when a system failure occurs (network, timeout, server down, etc.).
   * Use this for non-validation errors like connectivity issues.
   *
   * @param error - API error response with failure details
   */
  onFailure?: (error: ApiError) => void;

  /**
   * Called after request completes, regardless of success or failure.
   * Useful for cleanup operations like hiding loading indicators.
   */
  onFinish?: () => void;
}

/**
 * Internal submission options with transform support.
 * Used internally by transform builder methods.
 *
 * @template TResponse - Expected API response data type
 * @template TSchema - Zod schema type
 * @internal
 */
export interface InternalSubmitOptions<
  TResponse = unknown,
  TSchema extends ZodType = ZodType,
> extends SubmitOptions<TResponse> {
  /** Transform function applied before submission. */
  transform?: TransformFn<TSchema>;
}

/**
 * Configuration options for useForm hook.
 *
 * @template TSchema - Zod schema type for validation
 */
export interface UseFormOptions<TSchema extends ZodType> {
  /**
   * Zod schema for form validation.
   * If provided, validation runs before each submission.
   */
  schema?: TSchema;
}

/**
 * HTTP method shortcuts returned by transform builder.
 * Method signatures do not depend on the form schema; the generic is omitted to satisfy lint.
 */
export interface TransformMethods {
  /** GET request with transform applied. */
  get: <TResponse = unknown>(
    url: string,
    options?: SubmitOptions<TResponse>,
  ) => Promise<void>;

  /** POST request with transform applied. */
  post: <TResponse = unknown>(
    url: string,
    options?: SubmitOptions<TResponse>,
  ) => Promise<void>;

  /** PUT request with transform applied. */
  put: <TResponse = unknown>(
    url: string,
    options?: SubmitOptions<TResponse>,
  ) => Promise<void>;

  /** PATCH request with transform applied. */
  patch: <TResponse = unknown>(
    url: string,
    options?: SubmitOptions<TResponse>,
  ) => Promise<void>;

  /** DELETE request with transform applied. */
  destroy: <TResponse = unknown>(
    url: string,
    options?: SubmitOptions<TResponse>,
  ) => Promise<void>;
}

/**
 * Return type for useForm hook.
 *
 * @template TSchema - Zod schema type
 */
export interface UseFormReturn<TSchema extends ZodType> {
  // ─────────────────────────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────────────────────────

  /** Current form data state. */
  data: FormData<TSchema>;

  /** Form field errors (validation + server errors). */
  errors: FormErrors<FormData<TSchema>>;

  /** Whether form data differs from default values. */
  isDirty: boolean;

  /** Whether a submission is currently in progress. */
  processing: boolean;

  // ─────────────────────────────────────────────────────────────────────────────
  // Data Manipulation
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Update form field values.
   * Accepts single field key-value or partial data object.
   */
  setData: {
    <K extends keyof FormData<TSchema>>(
      key: K,
      value: FormData<TSchema>[K],
    ): void;
    (data: Partial<FormData<TSchema>>): void;
  };

  /**
   * Reset form fields to default values.
   * Resets all fields if no arguments provided, or specific fields if specified.
   */
  reset: (...fields: (keyof FormData<TSchema>)[]) => void;

  /**
   * Update default values for form fields.
   * Uses current data as defaults if no arguments provided.
   */
  setDefaults: {
    (): void;
    <K extends keyof FormData<TSchema>>(
      field: K,
      value: FormData<TSchema>[K],
    ): void;
    (data: Partial<FormData<TSchema>>): void;
  };

  /**
   * Set both data and defaults atomically.
   * Prevents dirty state issues when initializing with existing data.
   */
  setDataAndDefaults: (data: Partial<FormData<TSchema>>) => void;

  // ─────────────────────────────────────────────────────────────────────────────
  // Error Handling
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Set validation errors for form fields.
   * Accepts single field with message or multiple errors object.
   */
  setError: {
    (field: keyof FormData<TSchema> | string, message: string): void;
    (errors: FormErrors<FormData<TSchema>>): void;
  };

  /**
   * Clear validation errors.
   * Clears all errors if no arguments provided, or specific fields if specified.
   */
  clearErrors: (...fields: (keyof FormData<TSchema> | string)[]) => void;

  // ─────────────────────────────────────────────────────────────────────────────
  // Request Control
  // ─────────────────────────────────────────────────────────────────────────────

  /** Cancel the current form submission and reset processing state. */
  cancel: () => void;

  /**
   * Submit form data to API endpoint.
   * Validates data before submission if schema is provided.
   *
   * @template TResponse - Expected response data type
   * @param method - HTTP method to use
   * @param url - API endpoint URL
   * @param options - Submission callbacks
   */
  submit: <TResponse = unknown>(
    method: HttpMethod,
    url: string,
    options?: SubmitOptions<TResponse>,
  ) => Promise<void>;

  // ─────────────────────────────────────────────────────────────────────────────
  // HTTP Method Shortcuts
  // ─────────────────────────────────────────────────────────────────────────────

  /** GET request convenience method. */
  get: <TResponse = unknown>(
    url: string,
    options?: SubmitOptions<TResponse>,
  ) => Promise<void>;

  /** POST request convenience method. */
  post: <TResponse = unknown>(
    url: string,
    options?: SubmitOptions<TResponse>,
  ) => Promise<void>;

  /** PUT request convenience method. */
  put: <TResponse = unknown>(
    url: string,
    options?: SubmitOptions<TResponse>,
  ) => Promise<void>;

  /** PATCH request convenience method. */
  patch: <TResponse = unknown>(
    url: string,
    options?: SubmitOptions<TResponse>,
  ) => Promise<void>;

  /** DELETE request convenience method. */
  destroy: <TResponse = unknown>(
    url: string,
    options?: SubmitOptions<TResponse>,
  ) => Promise<void>;

  // ─────────────────────────────────────────────────────────────────────────────
  // Transform Builder
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create a chainable transform builder for form submission.
   * Returns HTTP method shortcuts that apply the transform before submission.
   */
  transform: (transformFn: TransformFn<TSchema>) => TransformMethods;
}
