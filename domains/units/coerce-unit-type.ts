import { UNIT_TYPE } from './constants';

const UNIT_TYPE_VALUES = Object.values(UNIT_TYPE) as string[];

/**
 * Resolves a unit `type` value from the API into a lowercase key that matches
 * {@link UNIT_TYPE} option values, or `undefined` if it cannot be mapped.
 *
 * Handles string values in any casing and nested objects (e.g. Laravel enum / API resource
 * shapes that expose `value`, `name`, or `slug`).
 */
export function coerceUnitTypeFromApi(raw: unknown): string | undefined {
  return coerceRecursive(raw, new Set());
}

function coerceRecursive(raw: unknown, seen: Set<unknown>): string | undefined {
  if (raw == null || raw === '') return undefined;
  if (typeof raw === 'string') {
    const n = raw.trim().toLowerCase();
    return UNIT_TYPE_VALUES.includes(n) ? n : undefined;
  }
  if (typeof raw === 'number') {
    const n = String(raw);
    return UNIT_TYPE_VALUES.includes(n) ? n : undefined;
  }
  if (typeof raw === 'object' && raw !== null) {
    if (seen.has(raw)) return undefined;
    seen.add(raw);
    const o = raw as Record<string, unknown>;
    const nested =
      o.value ?? o.name ?? o.slug ?? o.type ?? o.identifier ?? o.key;
    if (nested !== undefined && nested !== raw) {
      return coerceRecursive(nested, seen);
    }
  }
  return undefined;
}

/**
 * Reads `type` / `unit_type` from an API-shaped unit record and returns a canonical type string.
 */
export function getUnitTypeFromRecord(unit: {
  type?: unknown;
  unit_type?: unknown;
}): string | undefined {
  const raw = unit.type ?? unit.unit_type;
  return coerceUnitTypeFromApi(raw);
}
