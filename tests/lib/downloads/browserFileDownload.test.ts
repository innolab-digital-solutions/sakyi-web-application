import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  parseFilenameFromContentDisposition,
  triggerBrowserFileDownload,
} from '@/lib/downloads/browserFileDownload';

describe('parseFilenameFromContentDisposition', () => {
  describe('happy path', () => {
    it('extracts a quoted filename from a Laravel-style attachment header', () => {
      expect(
        parseFilenameFromContentDisposition(
          'attachment; filename="period-report-rpt-000148-2026-06-01-to-2026-06-14.pdf"',
        ),
      ).toBe('period-report-rpt-000148-2026-06-01-to-2026-06-14.pdf');
    });

    it('prefers RFC 5987 filename* over a plain filename', () => {
      expect(
        parseFilenameFromContentDisposition(
          "attachment; filename=\"fallback.pdf\"; filename*=UTF-8''period-report%20draft.pdf",
        ),
      ).toBe('period-report draft.pdf');
    });
  });

  describe('failure paths', () => {
    it('returns null when the header is missing', () => {
      expect(parseFilenameFromContentDisposition(null)).toBeNull();
      expect(parseFilenameFromContentDisposition(undefined)).toBeNull();
    });

    it('returns null when the header has no filename directive', () => {
      expect(
        parseFilenameFromContentDisposition('attachment; inline'),
      ).toBeNull();
    });
  });

  describe('boundary conditions', () => {
    it('returns null for empty or whitespace-only headers', () => {
      expect(parseFilenameFromContentDisposition('')).toBeNull();
      expect(parseFilenameFromContentDisposition('   ')).toBeNull();
    });

    it('extracts an unquoted filename token', () => {
      expect(
        parseFilenameFromContentDisposition(
          'attachment; filename=period-report-1.pdf',
        ),
      ).toBe('period-report-1.pdf');
    });

    it('returns the raw encoded value when decodeURIComponent fails', () => {
      expect(
        parseFilenameFromContentDisposition(
          "attachment; filename*=UTF-8''period-report%E0%A4%A.pdf",
        ),
      ).toBe('period-report%E0%A4%A.pdf');
    });
  });
});

describe('triggerBrowserFileDownload', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates an object URL, clicks a download anchor, then revokes the URL', () => {
    const click = vi.fn();
    const remove = vi.fn();
    const appendChild = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation((node) => node);
    const createObjectURL = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:mock-url');
    const revokeObjectURL = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => undefined);
    const createElement = vi
      .spyOn(document, 'createElement')
      .mockReturnValue({
        href: '',
        download: '',
        rel: '',
        click,
        remove,
      } as unknown as HTMLAnchorElement);

    const blob = new Blob(['%PDF'], { type: 'application/pdf' });
    triggerBrowserFileDownload(blob, 'period-report-9.pdf');

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(createElement).toHaveBeenCalledWith('a');
    expect(appendChild).toHaveBeenCalled();
    expect(click).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

    const anchor = createElement.mock.results[0]?.value as HTMLAnchorElement;
    expect(anchor.download).toBe('period-report-9.pdf');
    expect(anchor.href).toBe('blob:mock-url');
  });
});
