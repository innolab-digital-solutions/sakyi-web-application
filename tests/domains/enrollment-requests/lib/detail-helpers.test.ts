import { describe, expect, it } from 'vitest';

import type { EnrollmentRequestResource } from '@/domains/enrollment-requests/types';
import {
  getEnrollmentSummariesFromRequest,
  pickPrimaryEnrollment,
} from '@/domains/enrollment-requests/lib/detail-helpers';

function minimalRequest(
  overrides: Partial<EnrollmentRequestResource> = {},
): EnrollmentRequestResource {
  return {
    id: 1,
    code: 'SKER-2026-000001',
    phone: '+1',
    status: 'pending',
    cancellation_note: null,
    contacted_at: null,
    completed_at: null,
    cancelled_at: null,
    timestamps: { created_at: null, updated_at: null },
    ...overrides,
  };
}

describe('getEnrollmentSummariesFromRequest', () => {
  it('returns_empty_array_when_enrollments_key_is_absent', () => {
    expect(getEnrollmentSummariesFromRequest(minimalRequest())).toEqual([]);
  });

  it('returns_empty_array_when_enrollments_is_not_an_array', () => {
    const request = minimalRequest() as Record<string, unknown>;
    request.enrollments = null;
    expect(
      getEnrollmentSummariesFromRequest(request as EnrollmentRequestResource),
    ).toEqual([]);
  });

  it('preserves_backend_ordering_when_present', () => {
    const rows = [
      { id: 2, code: 'B', status: 'completed', starts_at: null, ends_at: null, completed_at: null, cancelled_at: null },
      { id: 1, code: 'A', status: 'active', starts_at: null, ends_at: null, completed_at: null, cancelled_at: null },
    ];
    expect(getEnrollmentSummariesFromRequest(minimalRequest({ enrollments: rows }))).toEqual(rows);
  });
});

describe('pickPrimaryEnrollment', () => {
  it('returns_null_when_no_rows', () => {
    expect(pickPrimaryEnrollment([])).toBeNull();
  });

  it('prefers_active_over_scheduled_and_first', () => {
    const primary = pickPrimaryEnrollment([
      { id: 1, code: 'X', status: 'scheduled', starts_at: null, ends_at: null, completed_at: null, cancelled_at: null },
      { id: 2, code: 'Y', status: 'active', starts_at: null, ends_at: null, completed_at: null, cancelled_at: null },
    ]);
    expect(primary?.code).toBe('Y');
  });

  it('falls_back_to_scheduled_when_no_active', () => {
    const primary = pickPrimaryEnrollment([
      { id: 1, code: 'done', status: 'completed', starts_at: null, ends_at: null, completed_at: null, cancelled_at: null },
      { id: 2, code: 'next', status: 'scheduled', starts_at: null, ends_at: null, completed_at: null, cancelled_at: null },
    ]);
    expect(primary?.code).toBe('next');
  });

  it('uses_first_when_no_active_or_scheduled', () => {
    const primary = pickPrimaryEnrollment([
      { id: 9, code: 'first', status: 'cancelled', starts_at: null, ends_at: null, completed_at: null, cancelled_at: null },
      { id: 8, code: 'second', status: 'completed', starts_at: null, ends_at: null, completed_at: null, cancelled_at: null },
    ]);
    expect(primary?.code).toBe('first');
  });
});
