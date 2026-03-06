import type { ApiResponse } from '@/types/api';

/**
 * Represents a health or wellness goal as defined in the system.
 *
 * @property id - Unique identifier for the goal.
 * @property name - Human-readable name of the goal.
 * @property slug - Unique slug used for routing or referencing the goal.
 * @property description - Description providing more detail about the goal.
 * @property is_active - Indicates whether the goal is currently active and selectable.
 *
 * Used to display, select, and manage user-facing wellness goals within
 * the application.
 */
export type Goal = {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
};

/**
 * API response shape for requests returning a list of goals.
 *
 * Uses the standard ApiResponse wrapper with the payload as an array of Goal objects.
 * Provides both success and error structural guarantees for robust API interaction.
 */
export type GoalResponse = ApiResponse<Goal[]>;
