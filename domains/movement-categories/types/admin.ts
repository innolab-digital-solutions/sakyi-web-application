export type MovementCategory = {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  parent: {
    id: number;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
};
