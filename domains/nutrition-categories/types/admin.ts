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
  /** Present when the API includes descendants; used to guard parent changes in admin forms. */
  children?: {
    id: number;
    name: string;
  }[];
  created_at: string;
  updated_at: string;
};
