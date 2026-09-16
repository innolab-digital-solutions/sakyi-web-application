import { describe, expect, it } from 'vitest';

import {
  canEditCarePlanDayContent,
  canEditCarePlanTimeline,
  firstCarePlanFieldErrorMessage,
  isClientLoggingPaused,
  isEnterEditModeRequiredError,
} from '@/lib/care-plans/builderEditMode';

describe('isClientLoggingPaused', () => {
  it('returns_true_only_for_strict_true', () => {
    expect(isClientLoggingPaused(true)).toBe(true);
    expect(isClientLoggingPaused(false)).toBe(false);
    expect(isClientLoggingPaused(null)).toBe(false);
    expect(isClientLoggingPaused(undefined)).toBe(false);
  });
});

describe('canEditCarePlanDayContent', () => {
  it('allows_draft_and_scheduled_in_edit_mode_without_pause', () => {
    expect(
      canEditCarePlanDayContent({
        mode: 'edit',
        status: 'draft',
        clientLoggingPaused: false,
      }),
    ).toBe(true);
    expect(
      canEditCarePlanDayContent({
        mode: 'edit',
        status: 'scheduled',
        clientLoggingPaused: false,
      }),
    ).toBe(true);
  });

  it('blocks_active_content_until_logging_is_paused', () => {
    expect(
      canEditCarePlanDayContent({
        mode: 'edit',
        status: 'active',
        clientLoggingPaused: false,
      }),
    ).toBe(false);
    expect(
      canEditCarePlanDayContent({
        mode: 'edit',
        status: 'active',
        clientLoggingPaused: true,
      }),
    ).toBe(true);
  });

  it('keeps_detail_mode_and_terminal_statuses_read_only', () => {
    expect(
      canEditCarePlanDayContent({
        mode: 'detail',
        status: 'draft',
        clientLoggingPaused: false,
      }),
    ).toBe(false);
    expect(
      canEditCarePlanDayContent({
        mode: 'edit',
        status: 'completed',
        clientLoggingPaused: true,
      }),
    ).toBe(false);
    expect(
      canEditCarePlanDayContent({
        mode: 'edit',
        status: 'cancelled',
        clientLoggingPaused: true,
      }),
    ).toBe(false);
  });
});

describe('canEditCarePlanTimeline', () => {
  it('allows_only_draft_and_scheduled_in_edit_mode', () => {
    expect(
      canEditCarePlanTimeline({ mode: 'edit', status: 'draft' }),
    ).toBe(true);
    expect(
      canEditCarePlanTimeline({ mode: 'edit', status: 'scheduled' }),
    ).toBe(true);
  });

  it('blocks_active_timeline_even_when_content_edit_mode_is_on', () => {
    expect(
      canEditCarePlanTimeline({ mode: 'edit', status: 'active' }),
    ).toBe(false);
  });

  it('blocks_timeline_in_detail_mode', () => {
    expect(
      canEditCarePlanTimeline({ mode: 'detail', status: 'draft' }),
    ).toBe(false);
  });
});

describe('isEnterEditModeRequiredError', () => {
  it('detects_care_plan_field_message_from_backend', () => {
    expect(
      isEnterEditModeRequiredError({
        errors: {
          care_plan:
            'Enter edit mode first to pause client logging, then edit this active care plan. Use revision for date or day-structure changes.',
        },
      }),
    ).toBe(true);
  });

  it('detects_message_fallback_when_errors_omit_care_plan', () => {
    expect(
      isEnterEditModeRequiredError({
        message: 'Enter edit mode first to pause client logging.',
      }),
    ).toBe(true);
  });

  it('returns_false_for_unrelated_validation_errors', () => {
    expect(
      isEnterEditModeRequiredError({
        errors: { title: 'Required' },
        message: 'Validation failed',
      }),
    ).toBe(false);
  });
});

describe('firstCarePlanFieldErrorMessage', () => {
  it('reads_string_or_array_care_plan_errors', () => {
    expect(
      firstCarePlanFieldErrorMessage({ care_plan: 'Paused required' }),
    ).toBe('Paused required');
    expect(
      firstCarePlanFieldErrorMessage({ care_plan: ['First', 'Second'] }),
    ).toBe('First');
  });

  it('returns_undefined_when_care_plan_error_is_missing', () => {
    expect(firstCarePlanFieldErrorMessage(undefined)).toBeUndefined();
    expect(firstCarePlanFieldErrorMessage({ title: 'x' })).toBeUndefined();
  });
});
