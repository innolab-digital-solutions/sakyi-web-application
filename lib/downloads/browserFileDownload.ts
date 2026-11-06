/**
 * Extracts a download filename from a Content-Disposition header.
 *
 * Prefers RFC 5987 `filename*=UTF-8''…`, then quoted `filename="…"`, then an
 * unquoted `filename=` token. Returns null when no usable name is present.
 *
 * @param disposition - Raw Content-Disposition header value (may be null/empty).
 * @returns Filename string, or null when the header cannot be parsed.
 */
export function parseFilenameFromContentDisposition(
  disposition: string | null | undefined,
): string | null {
  if (disposition == null) return null;
  const trimmed = disposition.trim();
  if (trimmed === '') return null;

  const rfc5987 = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(trimmed);
  if (rfc5987?.[1]) {
    const raw = rfc5987[1].trim().replace(/^"|"$/g, '');
    if (raw) {
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    }
  }

  const quoted = /filename\s*=\s*"([^"]+)"/i.exec(trimmed);
  const plainQuoted = quoted?.[1]?.trim();
  if (plainQuoted) return plainQuoted;

  // `filename=` but not `filename*=` — after `filename` the next char must be `=` / whitespace before `=`.
  const unquoted = /(?:^|;)\s*filename\s*=\s*([^;";\s]+)/i.exec(trimmed);
  const plain = unquoted?.[1]?.trim();
  return plain || null;
}

/**
 * Triggers a browser file download from an in-memory Blob.
 *
 * Creates a temporary object URL, programmatically clicks an anchor with the
 * given filename, then revokes the URL to avoid leaking memory.
 *
 * @param blob - File contents to save.
 * @param filename - Suggested download filename (including extension).
 */
export function triggerBrowserFileDownload(blob: Blob, filename: string): void {
  if (typeof document === 'undefined') {
    throw new Error('File download is only available in the browser.');
  }

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
