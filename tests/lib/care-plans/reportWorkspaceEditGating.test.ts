import { describe, expect, it } from 'vitest';

import {
  canConfirmClientReportAuthoring,
  canEditReportWorkspaceMetrics,
  canShowSubmitOperationalLogForReview,
  isArchivedClientReportStatus,
  isPublishedClientReportStatus,
} from '@/lib/care-plans/reportWorkspaceEditGating';

describe('isPublishedClientReportStatus', () => {
  it('returns true for published', () => {
    expect(isPublishedClientReportStatus('published')).toBe(true);
    expect(isPublishedClientReportStatus(' Published ')).toBe(true);
  });

  it('returns false for other or empty values', () => {
    expect(isPublishedClientReportStatus('in_review')).toBe(false);
    expect(isPublishedClientReportStatus('archived')).toBe(false);
    expect(isPublishedClientReportStatus(null)).toBe(false);
    expect(isPublishedClientReportStatus(undefined)).toBe(false);
  });
});

describe('isArchivedClientReportStatus', () => {
  it('returns true only for archived', () => {
    expect(isArchivedClientReportStatus('archived')).toBe(true);
    expect(isArchivedClientReportStatus('published')).toBe(false);
    expect(isArchivedClientReportStatus('')).toBe(false);
  });
});

describe('canEditReportWorkspaceMetrics', () => {
  describe('happy path', () => {
    it('allows edits on draft and in_progress logs', () => {
      expect(
        canEditReportWorkspaceMetrics({
          operationalLog: { status: 'draft', is_editable: true },
          clientReport: null,
        }),
      ).toBe(true);
      expect(
        canEditReportWorkspaceMetrics({
          operationalLog: { status: 'in_progress', is_editable: true },
          clientReport: { status: 'in_review', is_editable: true },
        }),
      ).toBe(true);
    });

    it('allows edits on locked logs with a published report (in-place correction)', () => {
      expect(
        canEditReportWorkspaceMetrics({
          operationalLog: { status: 'locked', is_editable: true },
          clientReport: { status: 'published', is_editable: true },
        }),
      ).toBe(true);
    });

    it('allows creating metrics when no log and no report exist', () => {
      expect(
        canEditReportWorkspaceMetrics({
          operationalLog: null,
          clientReport: null,
        }),
      ).toBe(true);
    });
  });

  describe('failure / read-only', () => {
    it('blocks archived reports even when the log is_editable', () => {
      expect(
        canEditReportWorkspaceMetrics({
          operationalLog: { status: 'locked', is_editable: true },
          clientReport: { status: 'archived', is_editable: false },
        }),
      ).toBe(false);
    });

    it('blocks when the client report is_editable is false', () => {
      expect(
        canEditReportWorkspaceMetrics({
          operationalLog: { status: 'in_progress', is_editable: true },
          clientReport: { status: 'in_review', is_editable: false },
        }),
      ).toBe(false);
    });

    it('blocks when the operational log is_editable is false', () => {
      expect(
        canEditReportWorkspaceMetrics({
          operationalLog: { status: 'draft', is_editable: false },
          clientReport: null,
        }),
      ).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('treats missing is_editable on the log as editable', () => {
      expect(
        canEditReportWorkspaceMetrics({
          operationalLog: { status: 'locked' },
          clientReport: { status: 'published' },
        }),
      ).toBe(true);
    });

    it('does not allow edits when a report exists but the log is missing', () => {
      expect(
        canEditReportWorkspaceMetrics({
          operationalLog: null,
          clientReport: { status: 'published', is_editable: true },
        }),
      ).toBe(false);
    });
  });
});

describe('canShowSubmitOperationalLogForReview', () => {
  it('shows generate/regenerate before publish', () => {
    expect(
      canShowSubmitOperationalLogForReview({
        operationalLog: { status: 'in_progress', is_editable: true },
        clientReport: null,
      }),
    ).toBe(true);
    expect(
      canShowSubmitOperationalLogForReview({
        operationalLog: { status: 'in_progress', is_editable: true },
        clientReport: { status: 'in_review' },
      }),
    ).toBe(true);
  });

  it('shows the same dialog for a published / locked report', () => {
    expect(
      canShowSubmitOperationalLogForReview({
        operationalLog: { status: 'locked', is_editable: true },
        clientReport: { status: 'published', is_editable: true },
      }),
    ).toBe(true);
  });

  it('hides submit when there is no log or the report is archived', () => {
    expect(
      canShowSubmitOperationalLogForReview({
        operationalLog: null,
        clientReport: null,
      }),
    ).toBe(false);
    expect(
      canShowSubmitOperationalLogForReview({
        operationalLog: { status: 'locked', is_editable: true },
        clientReport: { status: 'archived' },
      }),
    ).toBe(false);
  });
});

describe('canConfirmClientReportAuthoring', () => {
  it('requires in_progress before the first generate', () => {
    expect(
      canConfirmClientReportAuthoring({
        operationalLog: { status: 'draft', is_editable: true },
        clientReport: null,
      }),
    ).toBe(false);
    expect(
      canConfirmClientReportAuthoring({
        operationalLog: { status: 'in_progress', is_editable: true },
        clientReport: null,
      }),
    ).toBe(true);
  });

  it('allows confirm on a published report even when the log is locked', () => {
    expect(
      canConfirmClientReportAuthoring({
        operationalLog: { status: 'locked', is_editable: true },
        clientReport: { status: 'published', is_editable: true },
      }),
    ).toBe(true);
  });
});
