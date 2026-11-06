export type MovementCategory = {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  parent: {
    id: number;
    name: string;
  } | null;
  children: {
    id: number;
    name: string;
  }[];
  actions: {
    deletable: boolean;
    delete_block_reason?: string | null;
  };
  created_at: string;
  updated_at: string;
};
