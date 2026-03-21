import { describe, expect, it } from 'vitest';

import { STATUS } from '@/domains/programs/constants';
import {
  ProgramBodySchema,
  ProgramCreateSchema,
  ProgramUpdateSchema,
} from '@/domains/programs/schemas';

const validBody = {
  title: 'Test Program',
  slug: 'test-program',
  tagline: 'Tag',
  excerpt: 'Short',
  about: 'Long',
  features: ['a'],
  ideals: ['b'],
  expectations: ['c'],
  structures: ['d'],
  thumbnail_url: '',
  duration: '4 weeks',
  price: { amount: 99, currency: 'USD' },
  status: STATUS.PUBLISHED,
};

describe('ProgramBodySchema', () => {
  it('accepts a valid payload', () => {
    const parsed = ProgramBodySchema.safeParse(validBody);
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid slug', () => {
    const parsed = ProgramBodySchema.safeParse({
      ...validBody,
      slug: 'Invalid_Slug',
    });
    expect(parsed.success).toBe(false);
  });
});

describe('ProgramCreateSchema', () => {
  it('defaults status to draft when omitted', () => {
    const { status, ...rest } = validBody;
    const parsed = ProgramCreateSchema.safeParse(rest);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.status).toBe(STATUS.DRAFT);
    }
  });
});

describe('ProgramUpdateSchema', () => {
  it('allows partial updates', () => {
    const parsed = ProgramUpdateSchema.safeParse({ title: 'Only title' });
    expect(parsed.success).toBe(true);
  });
});
