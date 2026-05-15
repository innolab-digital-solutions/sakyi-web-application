import type { ApiResponse } from '@/types/api';

export type Status = 'pending' | 'active';

export type User = {
  id: number;
  client_code: string | null;
  name: string;
  email: string;
  status: Status;
  picture_url: string | null;
  role: 'Admin' | 'Client' | 'Prospect' | 'super_admin' | 'Super Admin';
  sign_in_options: {
    email_password: 'set' | 'not_set';
    google: 'connected' | 'not_connected';
  };
  actions: {
    deletable: boolean;
    delete_block_reason: string | null;
  };
  last_login_at: string | null;
};

export type UserResponse = ApiResponse<User>;
