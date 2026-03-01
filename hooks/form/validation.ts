import { ZodType } from 'zod';

import { FormData, FormErrors } from './types';

/**
 * Run Zod schema validation on form data.
 * Converts Zod validation errors to a flat field-error map.
 *
 * @template TSchema - Zod schema type
 * @param schema - Zod schema to validate against
 * @param data - Form data to validate
 * @returns Object with success flag and errors map
 */
export const validate = <TSchema extends ZodType>(
  schema: TSchema,
  data: FormData<TSchema>,
): { success: boolean; errors: FormErrors<FormData<TSchema>> } => {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, errors: {} };
  }

  const errors: FormErrors<FormData<TSchema>> = {};

  for (const issue of result.error.issues) {
    const path = issue.path.join('.') as keyof FormData<TSchema>;

    // Only keep the first error per field
    if (!(path in errors)) {
      errors[path] = issue.message;
    }
  }

  return { success: false, errors };
};
