import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type {
  TeamCreateInput,
  TeamMemberAssignInput,
  TeamUpdateInput,
} from '../schemas';
import type { Team } from '../types';

export async function getTeamById(id: number): Promise<ApiResponse<Team>> {
  return http.get<Team>(ENDPOINTS.ADMIN.MODULES.TEAMS.DETAIL(String(id)));
}

export async function createTeam(
  payload: TeamCreateInput,
): Promise<ApiResponse<Team>> {
  return http.post<Team>(ENDPOINTS.ADMIN.MODULES.TEAMS.CREATE, payload, {
    throwOnError: false,
  });
}

export async function updateTeam(
  id: number,
  payload: TeamUpdateInput,
): Promise<ApiResponse<Team>> {
  return http.put<Team>(
    ENDPOINTS.ADMIN.MODULES.TEAMS.UPDATE(String(id)),
    payload,
    { throwOnError: false },
  );
}

export async function deleteTeam(id: number): Promise<ApiResponse<void>> {
  return http.delete<void>(ENDPOINTS.ADMIN.MODULES.TEAMS.DELETE(String(id)), {
    throwOnError: false,
  });
}

export async function assignTeamMember(
  teamId: number,
  payload: TeamMemberAssignInput,
): Promise<ApiResponse<Team>> {
  return http.post<Team>(
    ENDPOINTS.ADMIN.MODULES.TEAMS.ASSIGN_MEMBER(String(teamId)),
    payload,
    { throwOnError: false },
  );
}

export async function removeTeamMember(
  teamId: number,
  userId: number,
): Promise<ApiResponse<void>> {
  return http.delete<void>(
    ENDPOINTS.ADMIN.MODULES.TEAMS.REMOVE_MEMBER(String(teamId), String(userId)),
    { throwOnError: false },
  );
}
