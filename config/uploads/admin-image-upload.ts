/**
 * Shared admin image picker rules (HTML `accept`, client preview MIME hints, max size).
 * Align backend validation (Laravel `mimes`, `max`) with these when changing.
 */
export const ADMIN_IMAGE_UPLOAD_ACCEPT =
  '.jpeg,.jpg,.png,.gif,.webp,.bmp,.heic,.heif,.avif';

export const ADMIN_IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

/**
 * Best-effort MIME for previews when the server or `File.type` omits it.
 */
export function mimeTypeFromImageFilename(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
    bmp: 'image/bmp',
    heic: 'image/heic',
    heif: 'image/heif',
    avif: 'image/avif',
    svg: 'image/svg+xml',
  };
  return map[ext] ?? 'image/jpeg';
}
