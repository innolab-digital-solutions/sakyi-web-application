/**
 * Helpers for seeding Generate-report average inputs from workspace /
 * existing report payloads.
 */

export type ReportAverageHighlight = {
  metric_key?: unknown;
  value?: unknown;
  is_visible_to_client?: unknown;
};

/**
 * Normalizes API average-input shapes (`number` or `{ value }`) to a finite number.
 *
 * @param raw - Value from report_generation_defaults or existing report average_inputs
 * @returns Finite number, or null when absent / invalid
 */
export function readAverageInputValue(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (raw != null && typeof raw === 'object' && 'value' in raw) {
    const value = (raw as { value?: unknown }).value;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return null;
}

/**
 * Display string for an average input; missing values become `"0"`.
 */
export function formatAverageInputDisplay(
  value: number | null | undefined,
): string {
  if (value == null || !Number.isFinite(value)) return '0';
  return String(value);
}

export type ResolveReportAverageInputParams = {
  metricKey: 'avg_intake' | 'avg_burn' | 'avg_steps' | 'avg_training_time';
  highlights: ReportAverageHighlight[];
  /** Existing client-report `average_inputs` map, if any. */
  existingAverageInputs: Record<string, unknown> | null | undefined;
  /** `report_generation_defaults.average_inputs[metricKey]` from workspace. */
  generationDefault: unknown;
  /**
   * Local dialog draft. Only used when no server-backed value exists so stale
   * leftovers (e.g. `"0"` from an earlier open) cannot mask fresh defaults.
   */
  currentValue: string;
};

/**
 * Resolves the string to show in a Generate-report average field.
 *
 * Priority: visible highlight → existing report average → workspace generation
 * default → local draft → `"0"`.
 */
export function resolveReportAverageInputForDialog(
  params: ResolveReportAverageInputParams,
): string {
  const fromHighlights = params.highlights.find((h) => {
    if (h.metric_key !== params.metricKey) return false;
    if (h.is_visible_to_client === false) return false;
    return true;
  });
  if (fromHighlights) {
    const highlightValue = readAverageInputValue(fromHighlights.value);
    if (highlightValue != null)
      return formatAverageInputDisplay(highlightValue);
  }

  const fromExisting = readAverageInputValue(
    params.existingAverageInputs?.[params.metricKey],
  );
  if (fromExisting != null) return formatAverageInputDisplay(fromExisting);

  const fromGeneration = readAverageInputValue(params.generationDefault);
  if (fromGeneration != null) return formatAverageInputDisplay(fromGeneration);

  const normalizedCurrent = params.currentValue.trim();
  if (normalizedCurrent.length > 0) return normalizedCurrent;

  return formatAverageInputDisplay(null);
}
