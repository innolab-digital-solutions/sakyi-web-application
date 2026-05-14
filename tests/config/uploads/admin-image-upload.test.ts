import { describe, expect, it } from 'vitest';

import {
  ADMIN_IMAGE_UPLOAD_ACCEPT,
  mimeTypeFromImageFilename,
} from '@/config/uploads/admin-image-upload';

describe('admin-image-upload', () => {
  it('lists_expected_extensions_in_accept_string', () => {
    expect(ADMIN_IMAGE_UPLOAD_ACCEPT).toContain('.jpeg');
    expect(ADMIN_IMAGE_UPLOAD_ACCEPT).toContain('.heic');
    expect(ADMIN_IMAGE_UPLOAD_ACCEPT).toContain('.avif');
  });

  it('maps_known_image_extensions_for_preview_mime', () => {
    expect(mimeTypeFromImageFilename('x.heic')).toBe('image/heic');
    expect(mimeTypeFromImageFilename('x.AVIF')).toBe('image/avif');
    expect(mimeTypeFromImageFilename('x.bmp')).toBe('image/bmp');
  });

  it('falls_back_to_jpeg_mime_for_unknown_extension', () => {
    expect(mimeTypeFromImageFilename('photo.xyz')).toBe('image/jpeg');
  });
});
