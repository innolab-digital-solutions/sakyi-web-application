
/**
 * Compares two URL query string representations to determine if they contain the same keys and values.
 *
 * This function normalizes query parameters (ignoring order) and performs a strict comparison
 * of both parameter names and their corresponding values.
 *
 * @param {string} a - The first query string to compare (e.g. "foo=1&bar=2").
 * @param {string} b - The second query string to compare.
 * @returns {boolean} True if both query strings have exactly the same parameter keys and values, false otherwise.
 *
 * @remarks
 * - Parameter value comparison uses strict equality.
 * - Parameter keys are sorted before comparison.
 * - Duplicate parameter keys (with multiple values) are ignored; only the first value per key is compared.
 */
export const tableQueriesEqual = (a: string, b: string): boolean => {
  const A = new URLSearchParams(a);
  const B = new URLSearchParams(b);
  const keysA = [...new Set([...A.keys()])].sort();
  const keysB = [...new Set([...B.keys()])].sort();
  if (keysA.length !== keysB.length) return false;
  for (let i = 0; i < keysA.length; i += 1) {
    if (keysA[i] !== keysB[i]) return false;
  }
  for (const key of keysA) {
    if (A.get(key) !== B.get(key)) return false;
  }
  return true;
};


