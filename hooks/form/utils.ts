/**
 * Deep clone utility using structuredClone with recursive fallback.
 *
 * @template T - Value type to clone
 * @param value - Value to deep clone
 * @returns Deep cloned value
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

/**
 * Compare two values for equality using JSON stringification.
 *
 * @param a - First value
 * @param b - Second value
 * @returns True if values are equal
 */
export const isEqual = (a: unknown, b: unknown): boolean => {
  return JSON.stringify(a) === JSON.stringify(b);
};
