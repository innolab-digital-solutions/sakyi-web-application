import type {
  CarePlanSectionItem,
  CarePlanSectionKey,
} from '@/domains/care-plans/types/admin';
import { CARE_PLAN_SECTION_TABS } from '@/lib/care-plans/carePlanSectionTabs';
import {
  type MovementExercisePrescriptionInput,
  normalizeMovementExercisePrescription,
} from '@/lib/care-plans/movementPrescription';

export type ClonedCarePlanDayContent = {
  sections: Record<CarePlanSectionKey, CarePlanSectionItem[]>;
  general_notes: string | null;
  daily_motivation: string | null;
};

const SECTION_KEYS = CARE_PLAN_SECTION_TABS.map((tab) => tab.key);

function cloneExerciseWithoutRowId(
  exercise: unknown,
): MovementExercisePrescriptionInput | null {
  const normalized = normalizeMovementExercisePrescription(
    exercise as Parameters<typeof normalizeMovementExercisePrescription>[0],
  );
  if (!normalized.movement_exercise_id) return null;
  const { id: _rowId, ...withoutId } = normalized;
  return withoutId;
}

/**
 * Clones a single section item for paste onto another care-plan day.
 * Strips server row ids and client-log locks so the target day creates new rows.
 */
export function cloneCarePlanSectionItem(
  item: CarePlanSectionItem,
): CarePlanSectionItem {
  const nutritionItemIds = Array.isArray(item.nutrition_item_ids)
    ? item.nutrition_item_ids
        .map((id) => String(id ?? '').trim())
        .filter((id) => id !== '')
    : Array.isArray(item.nutrition_items)
      ? item.nutrition_items
          .map((link) => String(link?.nutrition_item_id ?? '').trim())
          .filter((id) => id !== '')
      : [];

  const exercises = Array.isArray(item.exercises)
    ? item.exercises
        .map((exercise) => cloneExerciseWithoutRowId(exercise))
        .filter((x): x is MovementExercisePrescriptionInput => x !== null)
    : [];

  const cloned: CarePlanSectionItem = {
    title: typeof item.title === 'string' ? item.title : (item.title ?? ''),
    guidance:
      typeof item.guidance === 'string'
        ? item.guidance
        : typeof item.notes === 'string'
          ? item.notes
          : (item.guidance ?? ''),
    target_value: item.target_value ?? '',
    target_unit:
      typeof item.target_unit === 'string'
        ? item.target_unit
        : item.target_unit_id != null
          ? String(item.target_unit_id)
          : '',
    target_unit_id: item.target_unit_id ?? null,
    movement_exercise_id:
      item.movement_exercise_id ??
      item.exercise_id ??
      (exercises[0]?.movement_exercise_id || ''),
    exercises,
    nutrition_item_ids: nutritionItemIds,
    nutrition_items: nutritionItemIds.map((nutrition_item_id) => ({
      nutrition_item_id,
    })),
  };

  return cloned;
}

/**
 * Deep-clones a care-plan day's section content + note for duplication onto
 * other days. Item / prescription / nutrition-link row ids and client-log
 * flags are stripped so existing PUT section APIs create new rows.
 */
export function cloneCarePlanDayContent(source: {
  sections: Record<CarePlanSectionKey, CarePlanSectionItem[]>;
  general_notes: string | null;
  daily_motivation?: string | null;
}): ClonedCarePlanDayContent {
  const sections = {} as Record<CarePlanSectionKey, CarePlanSectionItem[]>;

  for (const key of SECTION_KEYS) {
    const items = source.sections?.[key] ?? [];
    sections[key] = items.map((item) => cloneCarePlanSectionItem(item));
  }

  const notes = String(source.general_notes ?? '').trim();
  const motivation = String(source.daily_motivation ?? '').trim();
  return {
    sections,
    general_notes: notes.length > 0 ? notes : null,
    daily_motivation: motivation.length > 0 ? motivation : null,
  };
}

/**
 * True when any section item on the day has client logs (paste should be blocked).
 */
export function dayHasClientLoggedItems(
  sections:
    | Record<CarePlanSectionKey, CarePlanSectionItem[]>
    | null
    | undefined,
): boolean {
  if (!sections) return false;
  for (const key of SECTION_KEYS) {
    const items = sections[key] ?? [];
    if (items.some((item) => Boolean(item?.has_client_logs))) return true;
  }
  return false;
}
