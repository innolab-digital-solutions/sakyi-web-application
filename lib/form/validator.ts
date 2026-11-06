import { ZodType } from 'zod';

import { FormErrors, FormFields } from './types';

/**
 * Validates form field data against a provided Zod schema.
 * Converts Zod validation errors into a flat error map keyed by field path.
 *
 * @param {ZodType} schema - The Zod schema to validate against.
 * @param {FormFields} data - The form data to validate (field name → value).
 * @returns {{ success: boolean; errors: FormErrors }}
 * - success: True if data passes schema validation, false otherwise.
 * - errors: Map of field paths to error messages, or empty if valid.
 *
 * @example
 * const { success, errors } = validateFields(schema, { email: '', password: '' });
 */
export const validateFormFields = (
  schema: ZodType,
  data: FormFields,
): {
  success: boolean;
  errors: FormErrors;
} => {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, errors: {} };
  }

  const errors: FormErrors = {};

  for (const issue of result.error.issues) {
    const path = issue.path.join('.') as keyof FormFields | string;

    // Only include the first error for each field
    if (!(path in errors)) {
      errors[path] = issue.message;
    }
  }

  return { success: false, errors };
};
