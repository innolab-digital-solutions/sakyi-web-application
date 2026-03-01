/**
 * Authenticated admin user shape as returned by the auth ME endpoint.
 *
 * Used by the auth service and AuthContext for session state.
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
  role: string;
  timestamps: {
    email_verified_at: string;
    last_login_at: string;
    created_at: string;
    updated_at: string;
  };
};
