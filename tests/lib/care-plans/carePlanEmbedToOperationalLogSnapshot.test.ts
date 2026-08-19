import { describe, expect, it } from 'vitest';

import { carePlanEmbedToOperationalLogSnapshot } from '@/lib/care-plans/carePlanEmbedToOperationalLogSnapshot';

describe('carePlanEmbedToOperationalLogSnapshot', () => {
  it('maps draft with editable true', () => {
    const s = carePlanEmbedToOperationalLogSnapshot({
      id: 1,
      code: 'SKOL-1',
      status: 'draft',
      is_editable: true,
    });
    expect(s).toMatchObject({
      id: 1,
      code: 'SKOL-1',
      status: 'draft',
      is_editable: true,
      metrics: [],
    });
  });

  it('defaults unknown status to locked', () => {
    const s = carePlanEmbedToOperationalLogSnapshot({
      id: 2,
      code: null,
      status: 'archived',
    });
    expect(s.status).toBe('locked');
  });

  it('treats missing is_editable as editable (backwards compatible)', () => {
    const s = carePlanEmbedToOperationalLogSnapshot({
      id: 3,
      code: 'X',
      status: 'in_progress',
    });
    expect(s.is_editable).toBe(true);
  });

  it('honours is_editable false', () => {
    const s = carePlanEmbedToOperationalLogSnapshot({
      id: 4,
      code: 'X',
      status: 'draft',
      is_editable: false,
    });
    expect(s.is_editable).toBe(false);
  });
});
