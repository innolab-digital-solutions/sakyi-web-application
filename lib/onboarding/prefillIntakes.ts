import type { OnboardingIntakeData } from '@/domains/onboarding/types/admin';

/**
 * Builds a search string for locating a client's prior intakes.
 */
export function buildClientIntakeSearchQuery(client: {
  name?: string | null;
  client_code?: string | null;
}): string {
  const code = client.client_code?.trim() ?? '';
  if (code) return code;
  return client.name?.trim() ?? '';
}

/**
 * Keeps completed intakes that belong to the same client and template.
 * Prefers newest completed timestamps first when present.
 */
export function filterCompatibleCompletedIntakes(args: {
  intakes: OnboardingIntakeData[];
  clientId: number;
  templateId: number;
}): OnboardingIntakeData[] {
  const matched = args.intakes.filter((intake) => {
    if ((intake.status ?? '').trim().toLowerCase() !== 'completed') {
      return false;
    }
    if (intake.client?.id !== args.clientId) return false;
    const templateId = intake.template?.id;
    if (templateId != null && templateId !== args.templateId) return false;
    return true;
  });

  return matched.sort((a, b) => {
    const aTime = Date.parse(a.timestamps.completed_at ?? a.timestamps.updated_at ?? '') || 0;
    const bTime = Date.parse(b.timestamps.completed_at ?? b.timestamps.updated_at ?? '') || 0;
    return bTime - aTime;
  });
}
