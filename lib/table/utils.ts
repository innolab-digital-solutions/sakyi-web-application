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

/**
 * Inputs for deciding whether a URL `search` value should overwrite the local
 * table search field. Used to prevent stale router updates from clobbering
 * in-progress typing (the field appearing to "backspace").
 */
export type UrlSearchSyncDecisionInput = {
  urlSearch: string;
  searchInput: string;
  appliedSearch: string;
  hasPendingOwnWrite: boolean;
};

/**
 * Returns whether the URL search value should be copied into local search state.
 *
 * Local typing is the source of truth until debounce commits a value. A delayed
 * `router.replace` for an earlier keystroke must not reset the input, and a write
 * we initiated must not be treated as back/forward navigation.
 *
 * Back/forward (and shared links) still apply when the user is not mid-keystroke
 * and no own URL write is waiting to land.
 *
 * @param input - Current URL search, local input, last applied search, and whether
 *   `useTable` has a navigation write that has not yet been confirmed by the router.
 * @returns True when local `searchInput` and `appliedSearch` should be set from the URL.
 */
export const shouldApplyUrlSearchToLocalState = (
  input: UrlSearchSyncDecisionInput,
): boolean => {
  if (input.hasPendingOwnWrite) return false;

  if (
    input.searchInput === input.urlSearch &&
    input.appliedSearch === input.urlSearch
  ) {
    return false;
  }

  const isTyping = input.searchInput !== input.appliedSearch;
  if (isTyping) return false;

  return input.urlSearch !== input.appliedSearch;
};
