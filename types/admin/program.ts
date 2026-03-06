import type { ApiResponse } from '@/types/api';

/**
 * Enumeration of possible states for a program's lifecycle within the admin system.
 *
 * - 'draft': Program is being edited and not visible to end users.
 * - 'published': Program is released and publicly visible.
 * - 'archived': Program is no longer active but retained for historical or administrative purposes.
 * - 'hidden': Program is excluded from public listings but not deleted or archived.
 *
 * Used to control program visibility, transitions, and available admin actions.
 */
export type Status = 'draft' | 'published' | 'archived' | 'hidden';

/**
 * Represents a structured admin-facing model of a Program entity.
 *
 * @property id - Unique identifier for the program.
 * @property thumbnail - URL or path to the main image for the program.
 * @property tagline - Short phrase summarizing the program's core value proposition.
 * @property title - Name presented to users.
 * @property slug - Unique slug for route generation and referencing.
 * @property excerpt - Brief summary or lead-in text for the program.
 * @property about - Detailed description providing background and context.
 * @property features - List of key program features.
 * @property ideals - List of values or principles upheld by the program.
 * @property expectations - List describing participant obligations or commitments.
 * @property structures - Program structures (e.g., session themes, weekly focuses).
 * @property duration - Period over which the program runs (e.g., "6 weeks").
 * @property price - Cost or fee associated with the program, as a formatted string.
 * @property status - Current workflow state of the program (see Status type).
 * @property goals - List of goal identifiers and names associated with the program.
 * @property timestamps - Important record lifecycle datetimes:
 *   - published_at: When the program was published (null if not yet published).
 *   - archived_at: When the program was archived (null if not archived).
 *   - created_at: Creation timestamp.
 *   - updated_at: Last update timestamp.
 *
 * This type is used for displaying, updating, and maintaining programs within
 * the admin interface. It models the structure as returned by the backend API.
 */
export type Program = {
  id: number;
  thumbnail: string;
  tagline: string;
  title: string;
  slug: string;
  excerpt: string;
  about: string;
  features: string[];
  ideals: string[];
  expectations: string[];
  structures: string[];
  duration: string;
  price: string;
  status: Status;
  goals: {
    id: number;
    name: string;
  }[];
  timestamps: {
    published_at: string | null;
    archived_at: string | null;
    created_at: string;
    updated_at: string;
  };
};

/**
 * Standard API response shape for a single Program entity.
 *
 * Wraps the Program object using the generic ApiResponse structure,
 * providing both success and error forms for robust error handling and
 * type-safe backend interaction.
 */
export type ProgramResponse = ApiResponse<Program>;
