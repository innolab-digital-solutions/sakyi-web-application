import { describe, expect, it } from 'vitest';

import {
  filterBlankDraftSectionItems,
  hasPersistedSectionItemId,
  isBlankDraftSectionItem,
  shouldRequireSectionItemTitle,
} from '@/lib/care-plans/sectionItemDrafts';

describe('hasPersistedSectionItemId', () => {
  it('returns_true_for_numeric_or_non_empty_string_ids', () => {
    expect(hasPersistedSectionItemId(88)).toBe(true);
    expect(hasPersistedSectionItemId('88')).toBe(true);
  });

  it('returns_false_for_missing_or_blank_ids', () => {
    expect(hasPersistedSectionItemId(null)).toBe(false);
    expect(hasPersistedSectionItemId(undefined)).toBe(false);
    expect(hasPersistedSectionItemId('')).toBe(false);
    expect(hasPersistedSectionItemId('   ')).toBe(false);
  });
});

describe('isBlankDraftSectionItem', () => {
  it('treats_untitled_rows_without_id_as_blank_drafts', () => {
    expect(isBlankDraftSectionItem({ title: '', id: undefined })).toBe(true);
    expect(isBlankDraftSectionItem({ title: '   ', id: null })).toBe(true);
  });

  it('keeps_titled_new_rows_and_persisted_rows', () => {
    expect(isBlankDraftSectionItem({ title: 'Breakfast' })).toBe(false);
    expect(isBlankDraftSectionItem({ title: '', id: 88 })).toBe(false);
  });
});

describe('filterBlankDraftSectionItems', () => {
  it('returns_empty_array_when_only_blank_drafts_remain', () => {
    expect(
      filterBlankDraftSectionItems([
        { title: '', guidance: null },
        { title: '   ' },
      ]),
    ).toEqual([]);
  });

  it('keeps_real_tasks_and_drops_trailing_blank_draft', () => {
    expect(
      filterBlankDraftSectionItems([
        { title: 'Breakfast', id: 1 },
        { title: '' },
      ]),
    ).toEqual([{ title: 'Breakfast', id: 1 }]);
  });

  it('keeps_persisted_row_even_when_title_is_cleared', () => {
    expect(filterBlankDraftSectionItems([{ title: '', id: 88 }])).toEqual([
      { title: '', id: 88 },
    ]);
  });
});

describe('shouldRequireSectionItemTitle', () => {
  it('requires_title_for_persisted_rows', () => {
    expect(
      shouldRequireSectionItemTitle({
        id: 88,
        title: '',
        hasStartedContent: false,
      }),
    ).toBe(true);
  });

  it('requires_title_when_admin_started_filling_a_new_row', () => {
    expect(
      shouldRequireSectionItemTitle({
        id: null,
        title: '',
        hasStartedContent: true,
      }),
    ).toBe(true);
  });

  it('does_not_require_title_for_pure_blank_placeholders', () => {
    expect(
      shouldRequireSectionItemTitle({
        id: null,
        title: '',
        hasStartedContent: false,
      }),
    ).toBe(false);
  });
});
