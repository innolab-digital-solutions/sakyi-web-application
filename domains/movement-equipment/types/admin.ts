export type MovementEquipment = {
  id: number;
  name: string;
  is_active: boolean;
  actions: {
    deletable: boolean;
    delete_block_reason?: string | null;
  };
  created_at: string;
  updated_at: string;
};
