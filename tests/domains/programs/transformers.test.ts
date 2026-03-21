import { describe, expect, it } from 'vitest';

import { mapMarketingProgramResponse } from '@/domains/programs/transformers';

describe('mapMarketingProgramResponse', () => {
  it('maps missing overview/description from excerpt/about', () => {
    const program = mapMarketingProgramResponse({
      id: 1,
      title: 'T',
      slug: 't',
      tagline: 'tag',
      excerpt: 'ex',
      about: 'ab',
      features: [],
      ideals: [],
      expectations: [],
      structures: [],
      thumbnail_url: '',
      duration: '1w',
      price: { amount: 0, currency: 'USD' },
      status: 'published',
    });

    expect(program.overview).toBe('ex');
    expect(program.description).toBe('ab');
  });
});
