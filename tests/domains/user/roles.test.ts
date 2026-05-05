import { describe, expect, it } from 'vitest';

import { isSuperAdminUser, SUPER_ADMIN_ROLE_SLUG } from '@/domains/user/roles';
import type { User } from '@/domains/user/types';

function userWithRole(role: User['role']): User {
  return {
    id: 1,
    client_code: null,
    name: 'Test',
    email: 'test@example.com',
    status: 'active',
    picture_url: '',
    role,
    sign_in_options: {
      email_password: 'set',
      google: 'not_connected',
    },
    actions: { deletable: false, delete_block_reason: null },
    last_login_at: null,
  };
}

describe('isSuperAdminUser', () => {
  it('returns true when slug role is exactly super_admin', () => {
    expect(isSuperAdminUser(userWithRole(SUPER_ADMIN_ROLE_SLUG))).toBe(true);
  });

  it('returns true when API sends spaced title casing', () => {
    expect(isSuperAdminUser(userWithRole('Super Admin'))).toBe(true);
  });

  it('returns false for standard admins and other roles', () => {
    expect(isSuperAdminUser(userWithRole('Admin'))).toBe(false);
    expect(isSuperAdminUser(userWithRole('Client'))).toBe(false);
    expect(isSuperAdminUser(userWithRole('Prospect'))).toBe(false);
  });

  it('returns false when user is nullish', () => {
    expect(isSuperAdminUser(null)).toBe(false);
    expect(isSuperAdminUser(undefined)).toBe(false);
  });

  it('returns false when role string is malformed', () => {
    expect(
      isSuperAdminUser({
        ...userWithRole('super_admin'),
        role: 'not-a-role' as User['role'],
      }),
    ).toBe(false);
  });

  it('handles surrounding whitespace', () => {
    expect(
      isSuperAdminUser({
        ...userWithRole('super_admin'),
        role: '  super_admin  ' as User['role'],
      }),
    ).toBe(true);
  });
});
