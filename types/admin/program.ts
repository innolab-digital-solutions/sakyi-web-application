/**
 * Represents a translated goal as returned via the admin Program API.
 */
export type ProgramGoal = {
  id: number;
  name: string | null;
  slug: string | null;
};

/**
 * Timestamps for a program entity in ISO string format, or null for not set.
 */
export type ProgramTimestamps = {
  published_at: string | null;
  archived_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

/**
 * Admin program entity as returned by the Laravel API for program lists/details.
 *
 * Represents a health or wellness program with all fields required to power the admin interface.
 *
 * Field mapping:
 * - thumbnail_url: string | null
 * - tagline, title, slug, overview, description, features, ideals, expectations, structures: translated fields
 * - goals: array of program goals (can be null if not loaded)
 * - timestamps: mapped from published_at, archived_at, created_at, updated_at as ISO-strings or null
 */
export type Program = {
  id: number;
  thumbnail_url: string | null;
  tagline: string | null;
  title: string | null;
  slug: string | null;
  overview: string | null;
  description: string | null;
  features: string[] | null;
  ideals: string[] | null;
  expectations: string[] | null;
  structures: string[] | null;
  duration: string | null;
  price: number | null;
  status: string;
  goals?: ProgramGoal[] | null; // nullable, only present if loaded via API
  timestamps: ProgramTimestamps;
};
