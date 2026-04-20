import type { ApiResponse } from '@/types/api';

export type Status = 'pending' | 'active' | 'suspended' | 'archived';

export type UserRole = {
  id: number;
  name: string;
};

export type User = {
  id: number;
  client_code: string | null;
  name: string;
  email: string;
  status: Status;
  role: UserRole | null;
  last_login_at: string | null;
};

export type UserResponse = ApiResponse<User>;
