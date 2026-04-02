export type NutritionCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  parent: {
    id: number;
    name: string;
    slug: string;
  } | null;
  created_at: string;
  updated_at: string;
};
