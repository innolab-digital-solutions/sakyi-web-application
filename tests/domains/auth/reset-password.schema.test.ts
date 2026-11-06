import { describe, expect, it } from 'vitest';

import { ResetPasswordSchema } from '@/domains/auth/schemas/reset-password.schema';

const validPassword = 'Aa1!abcdef';
const baseValid = {
  token: 'opaque-reset-token',
  email: 'user@example.com',
  password: validPassword,
  password_confirmation: validPassword,
};

describe('ResetPasswordSchema', () => {
  it('accepts valid Laravel-style reset payload', () => {
    const result = ResetPasswordSchema.safeParse(baseValid);
    expect(result.success).toBe(true);
  });

  it('rejects when token is missing', () => {
    const result = ResetPasswordSchema.safeParse({ ...baseValid, token: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('token'))).toBe(
        true,
      );
    }
  });

  it('rejects when passwords do not match', () => {
    const result = ResetPasswordSchema.safeParse({
      ...baseValid,
      password_confirmation: `${validPassword}x`,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((i) =>
          i.path.includes('password_confirmation'),
        ),
      ).toBe(true);
    }
  });

  it('rejects when password confirmation is empty', () => {
    const result = ResetPasswordSchema.safeParse({
      ...baseValid,
      password_confirmation: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects malformed email', () => {
    const result = ResetPasswordSchema.safeParse({
      ...baseValid,
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('rejects weak password that fails admin login rules', () => {
    const result = ResetPasswordSchema.safeParse({
      ...baseValid,
      password: 'short1!',
      password_confirmation: 'short1!',
    });
    expect(result.success).toBe(false);
  });
});
