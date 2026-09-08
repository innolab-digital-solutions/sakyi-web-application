import { describe, expect, it } from 'vitest';

import { shouldApplyUrlSearchToLocalState } from '@/lib/table/utils';

describe('shouldApplyUrlSearchToLocalState', () => {
  it('applies a different URL search when the local field is settled', () => {
    expect(
      shouldApplyUrlSearchToLocalState({
        urlSearch: 'yoga',
        searchInput: 'pilates',
        appliedSearch: 'pilates',
        hasPendingOwnWrite: false,
      }),
    ).toBe(true);
  });

  it('does_not_apply_url_search_when_an_own_write_is_still_pending', () => {
    expect(
      shouldApplyUrlSearchToLocalState({
        urlSearch: 'a',
        searchInput: 'abc',
        appliedSearch: 'a',
        hasPendingOwnWrite: true,
      }),
    ).toBe(false);
  });

  it('does_not_overwrite_the_field_while_the_user_is_still_typing', () => {
    expect(
      shouldApplyUrlSearchToLocalState({
        urlSearch: 'a',
        searchInput: 'abc',
        appliedSearch: 'a',
        hasPendingOwnWrite: false,
      }),
    ).toBe(false);
  });

  it('does_not_apply_when_url_and_local_search_are_already_in_sync', () => {
    expect(
      shouldApplyUrlSearchToLocalState({
        urlSearch: 'hello',
        searchInput: 'hello',
        appliedSearch: 'hello',
        hasPendingOwnWrite: false,
      }),
    ).toBe(false);
  });

  it('does_not_apply_empty_url_search_while_the_user_is_typing_the_first_characters', () => {
    expect(
      shouldApplyUrlSearchToLocalState({
        urlSearch: '',
        searchInput: 'h',
        appliedSearch: '',
        hasPendingOwnWrite: false,
      }),
    ).toBe(false);
  });

  it('applies_clearing_the_search_from_the_url_when_the_field_is_settled', () => {
    expect(
      shouldApplyUrlSearchToLocalState({
        urlSearch: '',
        searchInput: 'old',
        appliedSearch: 'old',
        hasPendingOwnWrite: false,
      }),
    ).toBe(true);
  });
});
