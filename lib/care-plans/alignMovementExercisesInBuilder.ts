import type {
  AdminCarePlanBuilder,
  CarePlanSectionItem,
} from '@/domains/care-plans/types/admin';
import { alignExercisesToRequestedOrder } from '@/lib/care-plans/movementPrescription';

/**
 * After a movement section upsert, re-applies the submitted `exercises[]` order
 * onto the builder response for the saved day so the UI never briefly (or
 * permanently) shows exercises sorted by row id.
 */
export function alignMovementExercisesInBuilder(
  builder: AdminCarePlanBuilder,
  dayId: number,
  savedItems: CarePlanSectionItem[],
): AdminCarePlanBuilder {
  const days = Array.isArray(builder.days) ? builder.days : [];
  const dayIndex = days.findIndex((day) => day.id === dayId);
  if (dayIndex < 0) return builder;

  const day = days[dayIndex]!;
  const responseItems = Array.isArray(day.sections?.movement)
    ? day.sections.movement
    : [];

  const unusedSavedIndexes = new Set(savedItems.map((_, index) => index));

  const findSavedItem = (
    responseItem: CarePlanSectionItem,
    itemIndex: number,
  ): CarePlanSectionItem | undefined => {
    const responseId = String(responseItem.id ?? '').trim();
    if (responseId) {
      const byIdIndex = savedItems.findIndex(
        (item, index) =>
          unusedSavedIndexes.has(index) &&
          String(item.id ?? '').trim() === responseId,
      );
      if (byIdIndex >= 0) {
        unusedSavedIndexes.delete(byIdIndex);
        return savedItems[byIdIndex];
      }
    }

    if (unusedSavedIndexes.has(itemIndex)) {
      unusedSavedIndexes.delete(itemIndex);
      return savedItems[itemIndex];
    }

    const fallbackIndex = [...unusedSavedIndexes][0];
    if (fallbackIndex == null) return undefined;
    unusedSavedIndexes.delete(fallbackIndex);
    return savedItems[fallbackIndex];
  };

  const alignedItems = responseItems.map((responseItem, itemIndex) => {
    const savedItem = findSavedItem(responseItem, itemIndex);
    if (!savedItem || !Array.isArray(savedItem.exercises)) {
      return responseItem;
    }

    return {
      ...responseItem,
      exercises: alignExercisesToRequestedOrder(
        responseItem.exercises,
        savedItem.exercises,
      ),
    };
  });

  const nextDays = days.map((entry, index) =>
    index === dayIndex
      ? {
          ...entry,
          sections: {
            ...entry.sections,
            movement: alignedItems,
          },
        }
      : entry,
  );

  return {
    ...builder,
    days: nextDays,
  };
}
