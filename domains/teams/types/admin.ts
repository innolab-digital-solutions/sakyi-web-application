export type TeamMemberRole = {
  id: number;
  name: string;
  label: string;
};

export type TeamMember = {
  id: number;
  name: string;
  email: string;
  role: TeamMemberRole | null;
  position: string;
  assigned_at: string;
};

export type TeamEnrollment = {
  id: number;
  code: string;
  status: string;
};

export type Team = {
  id: number;
  name: string;
  enrollment: TeamEnrollment | null;
  members: TeamMember[];
  members_count?: number;
  timestamps: {
    created_at: string;
    updated_at: string;
  };
};
