import type { User } from '@/domains/user/types';

/**
 * Whether the row represents a soft-deleted account (deleted list / trashed).
 */
export function isSoftDeletedUser(user: User): boolean {
  if (user.status === 'deleted') return true;
  return Boolean(user.deleted_at?.trim());
}

/**
 * Soft-delete is allowed when the API marks the row deletable.
 * Linked enrollments no longer block soft delete.
 */
export function canSoftDeleteUser(user: User): boolean {
  if (isSoftDeletedUser(user)) return false;
  return user.actions.deletable === true;
}

export function canRestoreUser(user: User): boolean {
  if (!isSoftDeletedUser(user)) return false;
  // Default to true for deleted rows unless API explicitly disables restore.
  return user.actions.restorable !== false;
}

/**
 * Permanent delete is always available for soft-deleted accounts.
 * Related enrollments, care plans, and other linked records are removed too.
 */
export function canForceDeleteUser(user: User): boolean {
  return isSoftDeletedUser(user);
}
