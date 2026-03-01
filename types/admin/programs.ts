/**
 * Goal reference as returned on a program (e.g. "Gain 3 kg (muscle)").
 */
export type ProgramGoal = {
  id: number;
  name: string;
};

/**
 * Timestamps for a program entity.
 */
export type ProgramTimestamps = {
  published_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Admin program entity as returned by the programs list/detail API.
 *
 * Represents a health or wellness program with metadata used in the admin
 * dashboard for listing, filtering, and managing programs.
 */
export type Program = {
  id: number;
  thumbnail: string;
  tagline: string;
  title: string;
  slug: string;
  overview: string;
  description: string;
  features: string[];
  ideals: string[];
  expectations: string[];
  structures: string[];
  duration: string;
  price: number;
  status: string;
  goal: ProgramGoal;
  timestamps: ProgramTimestamps;
};
