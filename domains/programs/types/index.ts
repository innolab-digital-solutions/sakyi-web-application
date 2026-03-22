/**
 * Marketing-facing program DTO (public API). Default `Program` export matches
 * pages and components that consume the marketing endpoints.
 */
export type { Program as AdminProgram } from './admin';
export type { Program } from './marketing';
