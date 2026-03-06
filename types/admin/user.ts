/**
 * Role shape when the API returns it as an object (e.g. with pivot data).
 */
export type UserRole = {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  pivot?: Record<string, unknown>;
};

/**
 * Authenticated admin user shape as returned by the auth ME endpoint.
 *
 * Used by the auth service and AuthContext for session state.
 * Note: `role` may be a string (role name) or a full role object depending on the API.
 */
export type User = {
  id: number;
  name: string;
  email: string;
  picture: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  address: string;
  status: 'active' | 'suspended' | 'archived';
  role: string | UserRole;
  timestamps: {
    email_verified_at: string;
    last_login_at: string;
    created_at: string;
    updated_at: string;
  };
};
