/**
 * Helpers for care-plan section upsert payloads.
 *
 * Aligns with backend empty-days / blank-draft rules:
 * - untitled rows without an `id` are unsaved UI placeholders
 * - empty sections should be saved as `items: []`
 * - title remains required for persisted rows and started drafts
 */

export type SectionItemDraftIdentity = {
  id?: string | number | null;
  title?: string | null;
};

/**
 * True when the row was previously saved (backend `id` present).
 */
export function hasPersistedSectionItemId(
  id: string | number | null | undefined,
): boolean {
  if (id == null) return false;
  return String(id).trim() !== '';
}

function normalizeDraftTitle(value: unknown): string {
  if (value == null) return '';
  return String(value).trim();
}

/**
 * Matches backend blank-draft filtering: empty/whitespace title and no `id`.
 */
export function isBlankDraftSectionItem(
  item: SectionItemDraftIdentity,
): boolean {
  return (
    !normalizeDraftTitle(item.title) && !hasPersistedSectionItemId(item.id)
  );
}

/**
 * Drops unsaved blank drafts so empty sections prefer `{ items: [] }`.
 */
export function filterBlankDraftSectionItems<
  T extends SectionItemDraftIdentity,
>(items: T[]): T[] {
  return items.filter((item) => !isBlankDraftSectionItem(item));
}

/**
 * Title is required for persisted rows or rows the admin has started filling.
 */
export function shouldRequireSectionItemTitle(args: {
  id?: string | number | null;
  title?: string | null;
  hasStartedContent: boolean;
}): boolean {
  if (hasPersistedSectionItemId(args.id)) return true;
  if (args.hasStartedContent) return true;
  return false;
}
