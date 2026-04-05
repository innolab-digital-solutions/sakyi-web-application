export type NutritionItem = {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  nutrition_category: {
    id: number;
    name: string;
  };
  default_unit_id: number | null;
  default_unit: {
    id: number;
    name: string;
    abbreviation: string;
  } | null;
  created_at: string;
  updated_at: string;
};
