import type { ApiResponse } from '@/types/api';

/**
 * Admin program entity as returned by the programs list/detail API.
 *
 * Represents a health or wellness program with metadata used in the admin
 * dashboard for listing, filtering, and managing programs.
 */
export type Program = {
  id: number;
  name: string;
  description: string;
  picture: string;
  price: string;
  enrollments: number;
  duration: string;
  status: string;
  timestamps?: {
    created_at: string;
    updated_at: string;
  };
};

/**
 * Standard API response wrapper for program list or single-program endpoints.
 *
 * Use with the shared HTTP client when fetching programs from the admin API.
 */
export type ProgramResponse = ApiResponse<Program>;
