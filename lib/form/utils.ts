/**
 * Deeply clones a value, producing a structurally identical but distinct copy.
 *
 * - Uses the native `structuredClone` if available in the environment for optimal performance and compatibility with complex objects.
 * - Falls back to a recursive manual strategy for arrays and plain objects in environments without `structuredClone` (e.g., Node.js < 17, some browsers).
 * - Primitives and values that are neither arrays nor objects (e.g., null, Date, RegExp, functions) are returned as-is.
 *
 * @template T - The type of the value to clone.
 * @param {T} value - The value to deeply clone (may be an object, array, or primitive).
 * @returns {T} A deep clone of the input value; mutations to the clone will not affect the original.
 *
 * @example
 * const original = { a: 1, b: { c: [2, 3] } };
 * const copy = deepClone(original);
 * copy.b.c[0] = 99;
 * # original.b.c[0] remains 2
 *
 * @note
 * This function does not preserve class instances, functions, Dates, Maps, Sets, or special objects when using the fallback mode.
 * For complex structured objects, ensure environment supports `structuredClone` or be aware of fallback limitations.
 */
export const deepClone = <T>(value: T): T => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  // Fallback for environments without structuredClone
  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item)) as unknown as T;
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = deepClone(val);
    }
    return result as T;
  }

  return value;
};
