import { describe, expect, it } from 'vitest';

import { NutritionItemBodySchema } from '@/domains/nutrition-items/schemas/base.schema';
import { NutritionItemCreateSchema } from '@/domains/nutrition-items/schemas/create.schema';

const baseValid = {
  name: 'Greek Yogurt',
  description: 'High protein snack',
  nutrition_category_id: 3,
  default_unit_id: 8,
  is_active: true,
};

describe('NutritionItemBodySchema estimated_calories', () => {
  it('accepts a valid estimated_calories number', () => {
    const result = NutritionItemBodySchema.safeParse({
      ...baseValid,
      estimated_calories: 150.5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.estimated_calories).toBe(150.5);
    }
  });

  it('accepts null and omitted estimated_calories', () => {
    expect(
      NutritionItemBodySchema.safeParse({
        ...baseValid,
        estimated_calories: null,
      }).success,
    ).toBe(true);

    const omitted = NutritionItemBodySchema.safeParse(baseValid);
    expect(omitted.success).toBe(true);
    if (omitted.success) {
      expect(omitted.data.estimated_calories).toBeUndefined();
    }
  });

  it('rejects estimated_calories below 0', () => {
    const result = NutritionItemBodySchema.safeParse({
      ...baseValid,
      estimated_calories: -1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects estimated_calories above 999999.99', () => {
    const result = NutritionItemBodySchema.safeParse({
      ...baseValid,
      estimated_calories: 1_000_000,
    });
    expect(result.success).toBe(false);
  });

  it('accepts the maximum allowed value', () => {
    const result = NutritionItemBodySchema.safeParse({
      ...baseValid,
      estimated_calories: 999999.99,
    });
    expect(result.success).toBe(true);
  });
});

describe('NutritionItemCreateSchema estimated_calories', () => {
  it('includes estimated_calories on create payloads', () => {
    const result = NutritionItemCreateSchema.safeParse({
      ...baseValid,
      estimated_calories: 220,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.estimated_calories).toBe(220);
    }
  });
});
