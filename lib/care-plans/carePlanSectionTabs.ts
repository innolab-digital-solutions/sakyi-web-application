import {
  AppleIcon,
  DumbbellIcon,
  FootprintsIcon,
  HeartPulseIcon,
} from 'lucide-react';
import type { ComponentType } from 'react';

import type { CarePlanSectionKey } from '@/domains/care-plans/types/admin';

/**
 * Care plan day builder tabs: section key, label, and the same icon used in
 * {@link CarePlanBuilder} `TabsList` (Nutrition, Movement, Activity, Recovery).
 */
export const CARE_PLAN_SECTION_TABS: ReadonlyArray<{
  key: CarePlanSectionKey;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { key: 'nutrition', label: 'Nutrition', icon: AppleIcon },
  { key: 'movement', label: 'Movement', icon: DumbbellIcon },
  { key: 'activity', label: 'Activity', icon: FootprintsIcon },
  { key: 'recovery', label: 'Recovery', icon: HeartPulseIcon },
];

/**
 * Resolves section metadata for a section key; returns `undefined` if the key
 * is not a known `CarePlanSectionKey` (e.g. future API value).
 */
export function getCarePlanSectionTab(
  key: string,
): (typeof CARE_PLAN_SECTION_TABS)[number] | undefined {
  return CARE_PLAN_SECTION_TABS.find((s) => s.key === key);
}
