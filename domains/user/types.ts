import type { ApiResponse } from '@/types/api';

export type Status = 'pending' | 'active' | 'suspended' | 'archived';

export type User = {
  id: string;
  role?: string;
  name: string;
  email: string;
  picture: string;
  dob: string;
  gender: string;
  phone: string;
  address: string;
  status: Status;
  timestamps: {
    email_verified_at: string;
    last_login_at: string;
    created_at: string;
    updated_at: string;
  };
};

export type UserResponse = ApiResponse<User>;
