export interface TeamMember {
  id: number;
  name: string;
  email: string;
  picture: string | null;
  /** Staff role label when API returns it (`lookup/team-members`). */
  role?: string | null;
}
