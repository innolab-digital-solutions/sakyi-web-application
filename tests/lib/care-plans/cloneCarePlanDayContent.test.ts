import { describe, expect, it } from 'vitest';

import type {
  CarePlanSectionItem,
  CarePlanSectionKey,
} from '@/domains/care-plans/types/admin';
import { CARE_PLAN_SECTION_TABS } from '@/lib/care-plans/carePlanSectionTabs';
import {
  cloneCarePlanDayContent,
  cloneCarePlanSectionItem,
  dayHasClientLoggedItems,
} from '@/lib/care-plans/cloneCarePlanDayContent';

const SECTION_KEYS = CARE_PLAN_SECTION_TABS.map((tab) => tab.key);

function emptySections(): Record<CarePlanSectionKey, CarePlanSectionItem[]> {
  return Object.fromEntries(SECTION_KEYS.map((key) => [key, []])) as Record<
    CarePlanSectionKey,
    CarePlanSectionItem[]
  >;
}

describe('cloneCarePlanSectionItem', () => {
  describe('happy path', () => {
    it('preserves titles, targets, and nutrition link ids while stripping row ids and log flags', () => {
      const source: CarePlanSectionItem = {
        id: 42,
        title: 'Breakfast',
        guidance: 'High protein',
        target_value: '500',
        target_unit: 'kcal',
        target_unit_id: 7,
        has_client_logs: true,
        actions: { exercises_editable: false },
        nutrition_item_ids: ['n-1', '  ', 'n-2'],
        nutrition_items: [
          { id: 99, nutrition_item_id: 'n-1' },
          { id: 100, nutrition_item_id: 'n-2' },
        ],
      };

      const cloned = cloneCarePlanSectionItem(source);

      expect(cloned).not.toHaveProperty('id');
      expect(cloned).not.toHaveProperty('has_client_logs');
      expect(cloned).not.toHaveProperty('actions');
      expect(cloned.title).toBe('Breakfast');
      expect(cloned.guidance).toBe('High protein');
      expect(cloned.target_value).toBe('500');
      expect(cloned.target_unit).toBe('kcal');
      expect(cloned.target_unit_id).toBe(7);
      expect(cloned.nutrition_item_ids).toEqual(['n-1', 'n-2']);
      expect(cloned.nutrition_items).toEqual([
        { nutrition_item_id: 'n-1' },
        { nutrition_item_id: 'n-2' },
      ]);
    });

    it('preserves movement prescriptions and strips exercise link row ids', () => {
      const cloned = cloneCarePlanSectionItem({
        id: 10,
        title: 'Squat day',
        guidance: 'Warm up first',
        exercises: [
          {
            id: 555,
            movement_exercise_id: 12,
            sets: 3,
            reps: 8,
            rest_seconds: 90,
            duration_seconds: null,
            intensity: 'RPE 7',
            equipment_weight: 60,
            equipment_weight_unit_id: 2,
          },
        ],
      });

      expect(cloned.exercises).toHaveLength(1);
      expect(cloned.exercises?.[0]).not.toHaveProperty('id');
      expect(cloned.exercises?.[0]).toMatchObject({
        movement_exercise_id: '12',
        sets: '3',
        reps: '8',
        rest_seconds: '90',
        intensity: 'RPE 7',
        equipment_weight: '60',
        equipment_weight_unit_id: '2',
      });
      expect(cloned.movement_exercise_id).toBe('12');
    });
  });

  describe('edge cases', () => {
    it('falls back to notes when guidance is missing', () => {
      const cloned = cloneCarePlanSectionItem({
        title: 'Walk',
        notes: 'Easy pace',
      });
      expect(cloned.guidance).toBe('Easy pace');
    });

    it('derives nutrition_item_ids from nutrition_items when ids array is absent', () => {
      const cloned = cloneCarePlanSectionItem({
        title: 'Lunch',
        nutrition_items: [
          { nutrition_item_id: 'meal-a' },
          { nutrition_item_id: '' },
          { nutrition_item_id: 'meal-b' },
        ],
      });
      expect(cloned.nutrition_item_ids).toEqual(['meal-a', 'meal-b']);
      expect(cloned.nutrition_items).toEqual([
        { nutrition_item_id: 'meal-a' },
        { nutrition_item_id: 'meal-b' },
      ]);
    });

    it('drops exercises that lack a movement_exercise_id', () => {
      const cloned = cloneCarePlanSectionItem({
        title: 'Incomplete',
        exercises: [
          { id: 1, sets: 2, reps: 10 },
          { movement_exercise_id: 9, sets: 1, reps: 5 },
        ],
      });
      expect(cloned.exercises).toHaveLength(1);
      expect(cloned.exercises?.[0]?.movement_exercise_id).toBe('9');
    });

    it('uses target_unit_id string when target_unit is not a string', () => {
      const cloned = cloneCarePlanSectionItem({
        title: 'Water',
        target_unit_id: 3,
        target_unit: null,
      });
      expect(cloned.target_unit).toBe('3');
      expect(cloned.target_unit_id).toBe(3);
    });
  });
});

describe('cloneCarePlanDayContent', () => {
  describe('happy path', () => {
    it('clones every section and copies the day note as-is', () => {
      const sections = emptySections();
      sections.nutrition = [
        {
          id: 1,
          title: 'Breakfast',
          guidance: 'Eggs',
          has_client_logs: true,
          nutrition_item_ids: ['n-1'],
        },
      ];
      sections.movement = [
        {
          id: 2,
          title: 'Lift',
          exercises: [{ id: 88, movement_exercise_id: 4, sets: 3, reps: 5 }],
        },
      ];

      const cloned = cloneCarePlanDayContent({
        sections,
        general_notes: 'Focus on recovery',
        daily_motivation: 'Stay consistent today.',
      });

      expect(cloned.general_notes).toBe('Focus on recovery');
      expect(cloned.daily_motivation).toBe('Stay consistent today.');
      expect(cloned.sections.nutrition).toHaveLength(1);
      expect(cloned.sections.nutrition[0]).not.toHaveProperty('id');
      expect(cloned.sections.nutrition[0]).not.toHaveProperty('has_client_logs');
      expect(cloned.sections.nutrition[0]?.title).toBe('Breakfast');
      expect(cloned.sections.movement[0]?.exercises?.[0]).not.toHaveProperty('id');
      expect(cloned.sections.hydration).toEqual([]);
      expect(cloned.sections.sleep).toEqual([]);
      expect(cloned.sections.activity).toEqual([]);
      expect(cloned.sections.recovery).toEqual([]);
    });
  });

  describe('edge / empty cases', () => {
    it('keeps empty sections empty when the source has no items', () => {
      const cloned = cloneCarePlanDayContent({
        sections: emptySections(),
        general_notes: null,
        daily_motivation: null,
      });

      for (const key of SECTION_KEYS) {
        expect(cloned.sections[key]).toEqual([]);
      }
      expect(cloned.general_notes).toBeNull();
      expect(cloned.daily_motivation).toBeNull();
    });

    it('normalizes whitespace-only notes and motivation to null', () => {
      const cloned = cloneCarePlanDayContent({
        sections: emptySections(),
        general_notes: '   \n\t  ',
        daily_motivation: '  ',
      });
      expect(cloned.general_notes).toBeNull();
      expect(cloned.daily_motivation).toBeNull();
    });

    it('treats missing section keys as empty arrays', () => {
      const partial = {
        nutrition: [{ title: 'Only nutrition', guidance: '' }],
      } as unknown as Record<CarePlanSectionKey, CarePlanSectionItem[]>;

      const cloned = cloneCarePlanDayContent({
        sections: partial,
        general_notes: 'Note',
        daily_motivation: 'Tip',
      });

      expect(cloned.sections.nutrition).toHaveLength(1);
      expect(cloned.sections.movement).toEqual([]);
      expect(cloned.general_notes).toBe('Note');
      expect(cloned.daily_motivation).toBe('Tip');
    });
  });
});

describe('dayHasClientLoggedItems', () => {
  it('returns true when any section item has client logs', () => {
    const sections = emptySections();
    sections.sleep = [{ title: 'Sleep', has_client_logs: true }];
    expect(dayHasClientLoggedItems(sections)).toBe(true);
  });

  it('returns false when no items have client logs', () => {
    const sections = emptySections();
    sections.activity = [{ title: 'Steps', has_client_logs: false }];
    expect(dayHasClientLoggedItems(sections)).toBe(false);
  });

  it('returns false for null, undefined, or empty sections', () => {
    expect(dayHasClientLoggedItems(null)).toBe(false);
    expect(dayHasClientLoggedItems(undefined)).toBe(false);
    expect(dayHasClientLoggedItems(emptySections())).toBe(false);
  });
});
