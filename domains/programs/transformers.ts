import { STATUS } from './constants';
import type { Program } from './types/marketing';

type UnknownRecord = Record<string, unknown>;

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => (typeof item === 'string' ? item : String(item)));
}

function asPrice(value: unknown): Program['price'] {
  if (!value || typeof value !== 'object') {
    return { amount: 0, currency: 'USD' };
  }
  const p = value as UnknownRecord;
  const amount = typeof p.amount === 'number' ? p.amount : Number(p.amount) || 0;
  const currency =
    typeof p.currency === 'string' && p.currency.length === 3
      ? p.currency.toUpperCase()
      : 'USD';
  return { amount, currency };
}

function asStatus(value: unknown): Program['status'] {
  if (value === STATUS.DRAFT || value === 'draft') return 'draft';
  if (value === STATUS.ARCHIVED || value === 'archived') return 'archived';
  if (value === STATUS.HIDDEN) return 'draft';
  return 'published';
}

/**
 * Maps a marketing API JSON payload to the `Program` DTO used in the UI.
 * Fills `overview` / `description` from `excerpt` / `about` when the API omits them.
 */
export function mapMarketingProgramResponse(raw: unknown): Program {
  const r = (raw ?? {}) as UnknownRecord;

  const excerpt = String(r.excerpt ?? '');
  const about = String(r.about ?? '');

  return {
    id: typeof r.id === 'number' ? r.id : Number(r.id) || 0,
    title: String(r.title ?? ''),
    slug: String(r.slug ?? ''),
    tagline: String(r.tagline ?? ''),
    excerpt,
    about,
    overview: String(r.overview ?? excerpt),
    description: String(r.description ?? about),
    status: asStatus(r.status),
    features: asStringArray(r.features),
    ideals: asStringArray(r.ideals),
    expectations: asStringArray(r.expectations),
    structures: asStringArray(r.structures),
    thumbnail_url: String(r.thumbnail_url ?? ''),
    duration: String(r.duration ?? ''),
    price: asPrice(r.price),
  };
}

export function mapMarketingProgramListResponse(raw: unknown): Program[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(mapMarketingProgramResponse);
}
