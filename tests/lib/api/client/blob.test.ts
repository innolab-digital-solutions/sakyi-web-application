import { afterEach, describe, expect, it, vi } from 'vitest';

import { downloadPeriodReportPdf } from '@/domains/care-plans/services';
import { ApiClientError, fetchBlob } from '@/lib/api/client';

function mockFetchResponse(init: {
  ok: boolean;
  status: number;
  statusText?: string;
  /** Blob contents only — not full BodyInit (streams are not BlobPart). */
  body?: BlobPart;
  headers?: Record<string, string>;
  json?: unknown;
}) {
  const headers = new Headers(init.headers);
  return {
    ok: init.ok,
    status: init.status,
    statusText: init.statusText ?? '',
    headers,
    blob: vi.fn(async () => new Blob([init.body ?? 'pdf-bytes'])),
    json: vi.fn(async () => {
      if (init.json !== undefined) return init.json;
      throw new Error('Unexpected JSON parse');
    }),
  } as unknown as Response;
}

describe('fetchBlob', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('happy path', () => {
    it('returns the PDF blob and server filename from Content-Disposition', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        mockFetchResponse({
          ok: true,
          status: 200,
          body: '%PDF-1.4',
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition':
              'attachment; filename="period-report-rpt-000148-2026-06-01-to-2026-06-14.pdf"',
          },
        }),
      );
      vi.stubGlobal('fetch', fetchMock);

      const result = await fetchBlob('/web/admin/period-reports/148/download');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/web/admin/period-reports/148/download'),
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        }),
      );
      expect(result.filename).toBe(
        'period-report-rpt-000148-2026-06-01-to-2026-06-14.pdf',
      );
      expect(result.contentType).toBe('application/pdf');
      expect(result.blob).toBeInstanceOf(Blob);
    });
  });

  describe('failure paths', () => {
    it('throws Report not found when the API returns 404 without JSON', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          mockFetchResponse({
            ok: false,
            status: 404,
            statusText: 'Not Found',
          }),
        ),
      );

      await expect(
        fetchBlob('/web/admin/period-reports/999/download'),
      ).rejects.toMatchObject({
        message: 'Report not found.',
        status: 404,
      } satisfies Partial<ApiClientError>);
    });

    it('prefers the backend JSON message on PDF generation failure', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          mockFetchResponse({
            ok: false,
            status: 500,
            json: {
              status: 'error',
              message: 'PDF engine unavailable.',
            },
          }),
        ),
      );

      await expect(
        fetchBlob('/web/admin/period-reports/1/download'),
      ).rejects.toMatchObject({
        message: 'PDF engine unavailable.',
        status: 500,
      });
    });

    it('throws a network ApiClientError when fetch itself fails', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
      );

      await expect(
        fetchBlob('/web/admin/period-reports/1/download'),
      ).rejects.toMatchObject({
        status: 0,
        isNetworkError: true,
      });
    });
  });

  describe('boundary conditions', () => {
    it('returns null filename when Content-Disposition is absent', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          mockFetchResponse({
            ok: true,
            status: 200,
            body: '%PDF',
            headers: { 'Content-Type': 'application/pdf' },
          }),
        ),
      );

      const result = await fetchBlob('/web/admin/period-reports/3/download');
      expect(result.filename).toBeNull();
    });

    it('uses the default PDF copy when a 500 response has a non-JSON body', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          mockFetchResponse({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
          }),
        ),
      );

      await expect(
        fetchBlob('/web/admin/period-reports/1/download'),
      ).rejects.toMatchObject({
        message: 'Could not generate PDF. Try again.',
        status: 500,
      });
    });
  });
});

describe('downloadPeriodReportPdf', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('falls back to period-report-{id}.pdf when the server omits a filename', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        mockFetchResponse({
          ok: true,
          status: 200,
          body: '%PDF',
          headers: { 'Content-Type': 'application/pdf' },
        }),
      ),
    );

    const result = await downloadPeriodReportPdf(42);
    expect(result.filename).toBe('period-report-42.pdf');
    expect(result.blob).toBeInstanceOf(Blob);
  });

  it('propagates API errors from the download endpoint', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        mockFetchResponse({
          ok: false,
          status: 403,
          json: {
            status: 'error',
            message: 'This action is unauthorized.',
          },
        }),
      ),
    );

    await expect(downloadPeriodReportPdf(7)).rejects.toMatchObject({
      message: 'This action is unauthorized.',
      status: 403,
    });
  });
});
