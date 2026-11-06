import { UNIT_TYPE } from '../constants';

export type Unit = {
  id: number;
  name: string;
  abbreviation: string;
  type: (typeof UNIT_TYPE)[keyof typeof UNIT_TYPE];
  is_active: boolean;
  actions: {
    deletable: boolean;
    delete_block_reason?: string | null;
  };
  timestamps: {
    created_at: string;
    updated_at: string;
  };
};
