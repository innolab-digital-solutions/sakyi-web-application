import type { ApiResponse } from '@/types/api';

/** Business account status preserved across soft delete / restore. */
export type AccountStatus = 'pending' | 'active' | 'suspended' | 'archived';

/**
 * List/UI status. `deleted` is a filter alias for soft-deleted accounts
 * (`GET /users?status=deleted`), not a DB enum value.
 */
export type Status = AccountStatus | 'deleted';

export type UserActions = {
  deletable: boolean;
  delete_block_reason: string | null;
  restorable?: boolean;
  force_deletable?: boolean;
  force_delete_block_reason?: string | null;
  force_delete_blockers?: string[] | null;
};

export type User = {
  id: number;
  client_code: string | null;
  name: string;
  email: string;
  status: Status;
  /** Preserved business status while `status` may be `deleted`. */
  account_status?: AccountStatus | null;
  deleted_at?: string | null;
  picture_url: string | null;
  role: 'Admin' | 'Client' | 'Prospect' | 'super_admin' | 'Super Admin';
  sign_in_options: {
    email_password: 'set' | 'not_set';
    google: 'connected' | 'not_connected';
  };
  actions: UserActions;
  last_login_at: string | null;
};

export type UserResponse = ApiResponse<User>;
