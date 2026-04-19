/** Same copy as the first-row empty state — reused for every row. */
export const CARE_TEAM_STAFF_REQUIRED = 'Select a staff member.';
export const CARE_TEAM_POSITION_REQUIRED = 'Enter their position.';

export type CareTeamRosterRow = {
  userId: string;
  position: string;
};

export function clearCareTeamFieldErrors(
  prev: Record<string, string>,
): Record<string, string> {
  const n = { ...prev };
  delete n.team_members;
  for (const k of Object.keys(n)) {
    if (
      k.startsWith('team_members.') ||
      /^row_\d+$/.test(k) ||
      /^position_\d+$/.test(k)
    ) {
      delete n[k];
    }
  }
  return n;
}

/**
 * Client-side care team roster validation (aligned with create-enrollment step 2).
 */
export function validateCareTeamRows(
  rows: CareTeamRosterRow[],
): Record<string, string> {
  const next: Record<string, string> = {};

  const completeCount = rows.filter(
    (r) => r.userId.trim() && r.position.trim(),
  ).length;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const hasUser = Boolean(r.userId?.trim());
    const hasPos = Boolean(r.position.trim());

    if (r.position.trim().length > 50) {
      next[`team_members.${i}.position`] =
        'Position must be at most 50 characters.';
    } else if (hasUser && !hasPos) {
      next[`team_members.${i}.position`] = CARE_TEAM_POSITION_REQUIRED;
    } else if (!hasUser && hasPos) {
      next[`team_members.${i}.user_id`] = CARE_TEAM_STAFF_REQUIRED;
    }
  }

  if (rows.length > 1) {
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const hasUser = Boolean(r.userId?.trim());
      const hasPos = Boolean(r.position.trim());
      if (hasUser || hasPos) continue;
      next[`team_members.${i}.user_id`] = CARE_TEAM_STAFF_REQUIRED;
      next[`team_members.${i}.position`] = CARE_TEAM_POSITION_REQUIRED;
    }
  }

  if (completeCount === 0) {
    const hasTeamFieldError = Object.keys(next).some((k) =>
      k.startsWith('team_members.'),
    );
    if (!hasTeamFieldError) {
      next['team_members.0.user_id'] = CARE_TEAM_STAFF_REQUIRED;
      next['team_members.0.position'] = CARE_TEAM_POSITION_REQUIRED;
    }
  }

  const seenUser = new Map<number, number>();
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r.userId?.trim() || !r.position?.trim()) continue;
    const uid = Number.parseInt(r.userId, 10);
    if (Number.isNaN(uid)) continue;
    if (seenUser.has(uid)) {
      next[`team_members.${i}.user_id`] =
        'This staff member is already assigned in another row.';
    } else {
      seenUser.set(uid, i);
    }
  }

  return next;
}
