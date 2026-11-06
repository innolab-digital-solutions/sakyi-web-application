import { describe, expect, it } from 'vitest';

import type { User, UserActions } from '@/domains/user/types';
import {
  canForceDeleteUser,
  canRestoreUser,
  canSoftDeleteUser,
  isSoftDeletedUser,
} from '@/lib/user/softDeleteActions';

function makeUser(
  overrides: Partial<Omit<User, 'actions'>> & {
    actions?: Partial<UserActions>;
  } = {},
): User {
  const { actions: actionOverrides, ...rest } = overrides;
  return {
    id: 1,
    client_code: null,
    name: 'Ada',
    email: 'ada@example.com',
    status: 'active',
    picture_url: null,
    role: 'Client',
    sign_in_options: {
      email_password: 'set',
      google: 'not_connected',
    },
    last_login_at: null,
    ...rest,
    actions: {
      deletable: true,
      delete_block_reason: null,
      restorable: false,
      force_deletable: false,
      force_delete_block_reason: null,
      force_delete_blockers: null,
      ...actionOverrides,
    },
  };
}

describe('isSoftDeletedUser', () => {
  it('returns_true_when_status_is_deleted', () => {
    expect(isSoftDeletedUser(makeUser({ status: 'deleted' }))).toBe(true);
  });

  it('returns_true_when_deleted_at_is_present', () => {
    expect(
      isSoftDeletedUser(
        makeUser({
          status: 'active',
          deleted_at: '2026-11-01T08:00:00.000000Z',
        }),
      ),
    ).toBe(true);
  });

  it('returns_false_for_active_accounts', () => {
    expect(isSoftDeletedUser(makeUser())).toBe(false);
  });
});

describe('canSoftDeleteUser', () => {
  it('allows_soft_delete_when_api_marks_deletable', () => {
    expect(canSoftDeleteUser(makeUser({ actions: { deletable: true } }))).toBe(
      true,
    );
  });

  it('blocks_soft_delete_for_deleted_rows_or_non_deletable', () => {
    expect(
      canSoftDeleteUser(
        makeUser({
          status: 'deleted',
          actions: { deletable: true },
        }),
      ),
    ).toBe(false);
    expect(
      canSoftDeleteUser(
        makeUser({
          actions: {
            deletable: false,
            delete_block_reason: 'Cannot delete yourself.',
          },
        }),
      ),
    ).toBe(false);
  });
});

describe('canRestoreUser / canForceDeleteUser', () => {
  it('allows_restore_for_deleted_rows_unless_explicitly_disabled', () => {
    expect(
      canRestoreUser(
        makeUser({
          status: 'deleted',
          actions: { restorable: true },
        }),
      ),
    ).toBe(true);
    expect(
      canRestoreUser(
        makeUser({
          status: 'deleted',
          actions: { restorable: undefined },
        }),
      ),
    ).toBe(true);
    expect(
      canRestoreUser(
        makeUser({
          status: 'deleted',
          actions: { restorable: false },
        }),
      ),
    ).toBe(false);
    expect(canRestoreUser(makeUser())).toBe(false);
  });

  it('allows_force_delete_for_any_soft_deleted_user_even_with_linked_records', () => {
    expect(
      canForceDeleteUser(
        makeUser({
          status: 'deleted',
          actions: {
            force_deletable: false,
            force_delete_blockers: ['enrollments', 'care plans'],
          },
        }),
      ),
    ).toBe(true);
    expect(canForceDeleteUser(makeUser())).toBe(false);
  });
});
