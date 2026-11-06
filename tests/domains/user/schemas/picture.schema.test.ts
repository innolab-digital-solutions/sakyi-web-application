import { describe, expect, it } from 'vitest';

import { OptionalUserPictureSchema } from '@/domains/user/schemas/picture.schema';

describe('OptionalUserPictureSchema', () => {
  it('passes_when_picture_is_undefined', () => {
    const result = OptionalUserPictureSchema.safeParse(undefined);
    expect(result.success).toBe(true);
  });

  it('passes_when_picture_is_a_valid_image_file', () => {
    const file = new File(['x'], 'avatar.png', { type: 'image/png' });
    const result = OptionalUserPictureSchema.safeParse(file);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(file);
    }
  });

  it('fails_when_picture_is_not_a_file', () => {
    const result = OptionalUserPictureSchema.safeParse('not-a-file');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('valid image');
    }
  });

  it('fails_when_picture_is_a_plain_object', () => {
    const result = OptionalUserPictureSchema.safeParse({ name: 'x' });
    expect(result.success).toBe(false);
  });
});
