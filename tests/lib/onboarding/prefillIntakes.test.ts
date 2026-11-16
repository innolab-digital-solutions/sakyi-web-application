import { describe, expect, it } from 'vitest';

import type { OnboardingIntakeData } from '@/domains/onboarding/types/admin';
import {
  buildClientIntakeSearchQuery,
  filterCompatibleCompletedIntakes,
} from '@/lib/onboarding/prefillIntakes';

function makeIntake(
  overrides: Partial<OnboardingIntakeData> & {
    id: number;
    status?: string;
    clientId?: number;
    templateId?: number;
    completedAt?: string | null;
  },
): OnboardingIntakeData {
  const {
    id,
    status = 'completed',
    clientId = 10,
    templateId = 3,
    completedAt = '2026-11-01T08:00:00.000000Z',
    ...rest
  } = overrides;

  return {
    id,
    code: `INT-${id}`,
    status,
    notes: null,
    cancellation_note: null,
    client: {
      id: clientId,
      client_code: `C-${clientId}`,
      name: 'Ada',
      email: 'ada@example.com',
      picture_url: null,
    },
    template: {
      id: templateId,
      title: 'Template',
      version: 1,
      sections: [],
    },
    timestamps: {
      created_at: completedAt,
      updated_at: completedAt,
      completed_at: completedAt,
    },
    ...rest,
  };
}

describe('buildClientIntakeSearchQuery', () => {
  it('prefers_client_code_over_name', () => {
    expect(
      buildClientIntakeSearchQuery({
        name: 'Ada Lovelace',
        client_code: 'CL-100',
      }),
    ).toBe('CL-100');
  });

  it('falls_back_to_name_when_code_missing', () => {
    expect(
      buildClientIntakeSearchQuery({
        name: 'Ada Lovelace',
        client_code: null,
      }),
    ).toBe('Ada Lovelace');
  });

  it('returns_empty_string_when_both_missing', () => {
    expect(buildClientIntakeSearchQuery({})).toBe('');
  });
});

describe('filterCompatibleCompletedIntakes', () => {
  it('keeps_completed_same_client_same_template_newest_first', () => {
    const result = filterCompatibleCompletedIntakes({
      clientId: 10,
      templateId: 3,
      intakes: [
        makeIntake({
          id: 1,
          completedAt: '2026-10-01T00:00:00.000Z',
        }),
        makeIntake({
          id: 2,
          completedAt: '2026-11-01T00:00:00.000Z',
        }),
        makeIntake({
          id: 3,
          status: 'in_progress',
        }),
        makeIntake({
          id: 4,
          clientId: 99,
        }),
        makeIntake({
          id: 5,
          templateId: 9,
        }),
      ],
    });

    expect(result.map((row) => row.id)).toEqual([2, 1]);
  });

  it('returns_empty_when_no_compatible_sources_exist', () => {
    expect(
      filterCompatibleCompletedIntakes({
        clientId: 10,
        templateId: 3,
        intakes: [
          makeIntake({ id: 1, status: 'draft' }),
          makeIntake({ id: 2, clientId: 11 }),
        ],
      }),
    ).toEqual([]);
  });

  it('includes_completed_intake_when_template_is_missing_from_list_payload', () => {
    const intake = makeIntake({ id: 7 });
    delete intake.template;
    expect(
      filterCompatibleCompletedIntakes({
        clientId: 10,
        templateId: 3,
        intakes: [intake],
      }),
    ).toHaveLength(1);
  });
});
