export type MovementEquipment = {
  id: number;
  name: string;
  equipment_type: string | null;
  training_section: string | null;
  is_active: boolean;
  actions: {
    deletable: boolean;
    delete_block_reason?: string | null;
  };
  created_at: string;
  updated_at: string;
};
