'use client';

import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  Trash2Icon,
  UserPlusIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import ComboboxField, {
  type ComboboxOption,
} from '@/components/shared/form/ComboBoxField';
import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ENDPOINTS } from '@/config/api/endpoints';
import { ROUTES } from '@/config/routes';
import {
  TEAM_ROLE_VALUES,
  TeamCreateSchema,
  type TeamRoleName,
  TeamUpdateSchema,
} from '@/domains/teams/schemas';
import {
  assignTeamMember,
  getTeamById,
  removeTeamMember,
} from '@/domains/teams/services';
import type { Team, TeamMember } from '@/domains/teams/types';
import { http } from '@/lib/api/client';
import { useForm } from '@/lib/form';

// ── Role options (mirrors AuthorizeRole enum in the backend) ─────────────────
const ROLE_OPTIONS: ComboboxOption[] = [
  { value: 'doctor', label: 'Doctor' },
  { value: 'admin', label: 'Admin' },
  { value: 'support', label: 'Support' },
  { value: 'super_admin', label: 'Super Admin' },
];

// ── Position options (from backend TeamSeeder) ───────────────────────────────
const POSITION_OPTIONS: ComboboxOption[] = [
  { value: 'Lead Doctor', label: 'Lead Doctor' },
  { value: 'Support Staff', label: 'Support Staff' },
  { value: 'Nutritionist', label: 'Nutritionist' },
  { value: 'Physiotherapist', label: 'Physiotherapist' },
  { value: 'Coach', label: 'Coach' },
];

// ── Staff pool hook ──────────────────────────────────────────────────────────
// Builds a deduplicated list of known staff by scanning existing team members.
// The API has no dedicated staff-listing endpoint; this is the best available
// approach. Staff not yet in any team won't appear as suggestions (the admin
// can still type any name — the backend validates its existence).
function useStaffPool(excludeTeamId?: number) {
  const { data: teamsPage } = useQuery({
    queryKey: ['teams-pool-list'],
    queryFn: async () => {
      const res = await http.get<Team[]>(
        `${ENDPOINTS.ADMIN.MODULES.TEAMS.LIST}?per_page=100`,
      );
      if (res.status !== 'success') return [];
      return (
        (res.data as unknown as { data: Team[] }).data ??
        (res.data as unknown as Team[])
      );
    },
    staleTime: 60_000,
  });

  const eligibleTeams = useMemo(
    () =>
      (teamsPage ?? []).filter(
        (t) => (t.members_count ?? 0) > 0 && t.id !== excludeTeamId,
      ),
    [teamsPage, excludeTeamId],
  );

  const memberQueries = useQueries({
    queries: eligibleTeams.map((team) => ({
      queryKey: ['teams-pool-member', team.id],
      queryFn: async () => {
        const res = await getTeamById(team.id);
        if (res.status !== 'success') return [];
        return res.data.members ?? [];
      },
      staleTime: 60_000,
    })),
  });

  // Deduplicate by user id inline — the list is small (< ~50 users) so
  // memoization adds no meaningful benefit and avoids the variable-length
  // dep array that would violate React's Rules of Hooks.
  const staffUsersSeen = new Map<number, TeamMember>();
  for (const q of memberQueries) {
    for (const member of q.data ?? []) {
      if (!staffUsersSeen.has(member.id)) staffUsersSeen.set(member.id, member);
    }
  }
  const staffUsers = Array.from(staffUsersSeen.values());

  const isLoading =
    eligibleTeams.length > 0 && memberQueries.some((q) => q.isPending);

  return { staffUsers, isLoading };
}

// ── Pending member type (used in create mode before team exists) ─────────────
type PendingMember = {
  key: string;
  name: string;
  role_name: TeamRoleName;
  role_label: string;
  position: string;
};

// ── Props ────────────────────────────────────────────────────────────────────
type CreateProps = { mode: 'create'; team?: never };
type EditProps = { mode: 'edit'; team: Team };
type Props = CreateProps | EditProps;

export default function TeamForm({ mode, team }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = mode === 'edit';

  // ── Main form ────────────────────────────────────────────────────────────
  const initialFields = useMemo(() => {
    if (isEdit && team) return { name: team.name };
    return { name: '', enrollment_id: null as number | null };
  }, [isEdit, team]);

  const form = useForm(initialFields, {
    schema: isEdit ? TeamUpdateSchema : TeamCreateSchema,
  });

  useEffect(() => {
    if (!isEdit || !team) return;
    form.setDataAndDefaults({ name: team.name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, team]);

  // ── Staff pool for name suggestions ──────────────────────────────────────
  const { staffUsers, isLoading: poolLoading } = useStaffPool(
    isEdit ? team?.id : undefined,
  );

  // Members already in this team — exclude them from suggestions
  const currentMemberIds = useMemo(
    () => new Set((isEdit ? (team?.members ?? []) : []).map((m) => m.id)),
    [isEdit, team],
  );

  const nameOptions = useMemo<ComboboxOption[]>(
    () =>
      staffUsers
        .filter((u) => !currentMemberIds.has(u.id))
        .map((u) => ({
          value: u.name,
          label: u.name,
          keywords: [u.email, u.role?.label ?? ''],
          content: (
            <span className='flex flex-col gap-0.5'>
              <span className='text-foreground text-sm font-medium'>
                {u.name}
              </span>
              <span className='text-muted-foreground text-xs'>
                {u.email}
                {u.role ? ` · ${u.role.label}` : ''}
              </span>
            </span>
          ),
        })),
    [staffUsers, currentMemberIds],
  );

  // ── Members state ────────────────────────────────────────────────────────
  const [members, setMembers] = useState<TeamMember[]>(() =>
    isEdit ? (team?.members ?? []) : [],
  );
  useEffect(() => {
    if (isEdit && team) setMembers(team.members);
  }, [isEdit, team]);

  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [removingId, setRemovingId] = useState<number | null>(null);

  // ── Add-member row state ─────────────────────────────────────────────────
  const [showAddRow, setShowAddRow] = useState(false);
  const [addName, setAddName] = useState('');
  const [addRoleName, setAddRoleName] = useState<TeamRoleName | null>(null);
  const [addPosition, setAddPosition] = useState('');
  const [addErrors, setAddErrors] = useState<{
    name?: string;
    role_name?: string;
    position?: string;
  }>({});
  const [isAssigning, setIsAssigning] = useState(false);
  const addRowRef = useRef<HTMLDivElement>(null);

  const resetAddRow = () => {
    setAddName('');
    setAddRoleName(null);
    setAddPosition('');
    setAddErrors({});
    setShowAddRow(false);
  };

  const validateAddRow = (): boolean => {
    const errs: typeof addErrors = {};
    if (!addName.trim()) {
      errs.name = 'Member name is required.';
    } else {
      const nameLower = addName.trim().toLowerCase();
      const alreadyInTeam = members.some(
        (m) => m.name.toLowerCase() === nameLower,
      );
      const alreadyPending = pendingMembers.some(
        (m) => m.name.toLowerCase() === nameLower,
      );
      if (alreadyInTeam || alreadyPending)
        errs.name = 'This member is already in the team.';
    }
    if (!addRoleName) errs.role_name = 'Role is required.';
    if (!addPosition.trim()) errs.position = 'Position is required.';
    setAddErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Assign member mutation (edit mode — immediate API call) ──────────────
  const { mutateAsync: doAssign } = useMutation({
    mutationFn: async ({
      teamId,
      name,
      role_name,
      position,
    }: {
      teamId: number;
      name: string;
      role_name: TeamRoleName;
      position: string;
    }) => {
      const res = await assignTeamMember(teamId, { name, role_name, position });
      if (res.status === 'error')
        throw new Error(res.message || 'Failed to assign member.');
      return res;
    },
    onSuccess: (res) => {
      if (res.status === 'success' && res.data.members) {
        setMembers(res.data.members);
      }
      queryClient.invalidateQueries({
        queryKey: [
          ENDPOINTS.ADMIN.MODULES.TEAMS.DETAIL(String(team?.id)),
          team?.id,
        ],
      });
      queryClient.invalidateQueries({ queryKey: ['teams-pool-list'] });
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.ADMIN.MODULES.TEAMS.LIST],
      });
      toast.success('Member assigned successfully.');
      resetAddRow();
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to assign member.');
    },
  });

  // ── Remove member mutation (edit mode — immediate API call) ──────────────
  const { mutateAsync: doRemove } = useMutation({
    mutationFn: async ({
      teamId,
      userId,
    }: {
      teamId: number;
      userId: number;
    }) => {
      const res = await removeTeamMember(teamId, userId);
      if (res.status === 'error')
        throw new Error(res.message || 'Failed to remove member.');
    },
    onSuccess: (_data, { userId }) => {
      setMembers((prev) => prev.filter((m) => m.id !== userId));
      queryClient.invalidateQueries({
        queryKey: [
          ENDPOINTS.ADMIN.MODULES.TEAMS.DETAIL(String(team?.id)),
          team?.id,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.ADMIN.MODULES.TEAMS.LIST],
      });
      toast.success('Member removed.');
      setRemovingId(null);
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to remove member.');
      setRemovingId(null);
    },
  });

  const handleAssignInEdit = async () => {
    if (!validateAddRow() || !team || !addRoleName) return;
    setIsAssigning(true);
    try {
      await doAssign({
        teamId: team.id,
        name: addName.trim(),
        role_name: addRoleName,
        position: addPosition.trim(),
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAddPending = () => {
    if (!validateAddRow() || !addRoleName) return;
    const roleLabel =
      ROLE_OPTIONS.find((r) => r.value === addRoleName)?.label ?? addRoleName;
    setPendingMembers((prev) => [
      ...prev,
      {
        key: String(Date.now()),
        name: addName.trim(),
        role_name: addRoleName,
        role_label: roleLabel,
        position: addPosition.trim(),
      },
    ]);
    resetAddRow();
  };

  const removePending = (key: string) => {
    setPendingMembers((prev) => prev.filter((m) => m.key !== key));
  };

  // ── Main form submit ─────────────────────────────────────────────────────
  const submit = async () => {
    if (isEdit && team) {
      await form.put(ENDPOINTS.ADMIN.MODULES.TEAMS.UPDATE(String(team.id)), {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['table', ENDPOINTS.ADMIN.MODULES.TEAMS.LIST],
          });
          queryClient.invalidateQueries({
            queryKey: [
              ENDPOINTS.ADMIN.MODULES.TEAMS.DETAIL(String(team.id)),
              team.id,
            ],
          });
          toast.success('Team updated successfully.');
          router.push(ROUTES.ADMIN.MODULES.TEAMS.LIST);
        },
        onError: () => {
          toast.error('Please review the highlighted fields and try again.');
        },
        onFailure: (error) => {
          toast.error(error.message ?? 'Failed to update team.');
        },
      });
      return;
    }

    // Create mode: create the team, then assign each pending member
    await form.post(ENDPOINTS.ADMIN.MODULES.TEAMS.CREATE, {
      onSuccess: async (response) => {
        const newTeam = (response as unknown as { data: Team }).data;
        queryClient.invalidateQueries({
          queryKey: ['table', ENDPOINTS.ADMIN.MODULES.TEAMS.LIST],
        });

        for (const pm of pendingMembers) {
          const res = await assignTeamMember(newTeam.id, {
            name: pm.name,
            role_name: pm.role_name,
            position: pm.position,
          });
          if (res.status === 'error') {
            toast.warning(
              `Team created but could not assign ${pm.name}: ${res.message}`,
            );
          }
        }

        toast.success('Team created successfully.');
        router.push(ROUTES.ADMIN.MODULES.TEAMS.LIST);
      },
      onError: () => {
        toast.error('Please review the highlighted fields and try again.');
      },
      onFailure: (error) => {
        toast.error(error.message ?? 'Failed to create team.');
      },
    });
  };

  const loading = form.isSubmitting;

  return (
    <div className='space-y-6'>
      <Button
        asChild
        variant='ghost'
        size='sm'
        className='-ml-2 cursor-pointer'
      >
        <Link href={ROUTES.ADMIN.MODULES.TEAMS.LIST}>
          <ArrowLeftIcon className='size-4' />
          Back to Teams
        </Link>
      </Button>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        noValidate
      >
        <div className='space-y-5'>
          {/* Team info */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Team Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-5'>
              <TextField
                label='Team Name'
                required
                placeholder='e.g. Alpha Recovery Team'
                value={String(form.fields.name ?? '')}
                onChange={(e) => form.setData('name', e.target.value)}
                error={form.errors.name}
              />

              {isEdit && team?.enrollment ? (
                <div className='space-y-2'>
                  <p className='text-muted-foreground text-xs font-medium md:text-sm'>
                    Enrollment
                  </p>
                  <div className='border-border bg-muted/30 flex items-center gap-3 rounded-md border px-3 py-2.5'>
                    <div className='flex-1'>
                      <p className='text-foreground font-mono text-sm font-medium'>
                        {team.enrollment.code}
                      </p>
                      <p className='text-muted-foreground mt-0.5 text-xs capitalize'>
                        {team.enrollment.status}
                      </p>
                    </div>
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    The enrollment linked to this team cannot be changed after
                    creation.
                  </p>
                </div>
              ) : (
                !isEdit && (
                  <div className='space-y-2'>
                    <label className='after:text-destructive text-xs font-medium after:ml-0.5 after:content-["*"] md:text-sm'>
                      Enrollment ID
                    </label>
                    <input
                      type='number'
                      min={1}
                      placeholder='e.g. 42'
                      value={
                        form.fields.enrollment_id != null
                          ? String(form.fields.enrollment_id)
                          : ''
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        form.setData(
                          'enrollment_id',
                          v === '' ? null : Number(v),
                        );
                      }}
                      className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:h-12'
                    />
                    {form.errors.enrollment_id && (
                      <p className='text-destructive text-xs'>
                        {form.errors.enrollment_id}
                      </p>
                    )}
                    <p className='text-muted-foreground text-xs'>
                      Enter the ID of the enrollment this team is assigned to.
                      Each enrollment can only have one team.
                    </p>
                  </div>
                )
              )}
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0'>
              <CardTitle className='text-base'>Team Members</CardTitle>
              {!showAddRow && (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='cursor-pointer gap-1.5'
                  onClick={() => {
                    setShowAddRow(true);
                    setTimeout(
                      () =>
                        addRowRef.current
                          ?.querySelector<HTMLElement>('[role="combobox"]')
                          ?.focus(),
                      50,
                    );
                  }}
                >
                  <UserPlusIcon className='size-3.5' />
                  Add member
                </Button>
              )}
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Add member panel */}
              {showAddRow && (
                <div
                  ref={addRowRef}
                  className='border-border bg-muted/20 space-y-3 rounded-lg border p-4'
                >
                  <p className='text-foreground text-sm font-medium'>
                    Assign a member
                  </p>

                  {/* Name — combobox seeded from known staff; admin can type any exact name */}
                  <ComboboxField
                    label='Name'
                    required
                    placeholder='Search or type member name…'
                    searchPlaceholder='Type name or email…'
                    emptyMessage={
                      poolLoading
                        ? 'Loading known staff…'
                        : nameOptions.length === 0
                          ? "No known staff yet — type the member's exact name."
                          : "No match — type the member's exact name."
                    }
                    options={nameOptions}
                    value={addName || null}
                    onChange={(val) => {
                      const name = val ?? '';
                      setAddName(name);
                      setAddErrors((e) => ({ ...e, name: undefined }));
                      // Auto-fill role from pool when a known staff member is selected
                      const matched = staffUsers.find((u) => u.name === name);
                      if (
                        matched?.role?.name &&
                        TEAM_ROLE_VALUES.includes(
                          matched.role.name as TeamRoleName,
                        )
                      ) {
                        setAddRoleName(matched.role.name as TeamRoleName);
                        setAddErrors((e) => ({ ...e, role_name: undefined }));
                      } else if (!name) {
                        setAddRoleName(null);
                      }
                    }}
                    error={addErrors.name}
                  />

                  {/* Role — display only, auto-filled from selected member */}
                  {addRoleName && (
                    <div className='flex flex-col gap-1.5'>
                      <span className='text-sm font-medium'>Role</span>
                      <div className='border-input bg-muted text-foreground flex h-10 w-full items-center rounded-md border px-3 py-1 text-sm md:h-12'>
                        {ROLE_OPTIONS.find((r) => r.value === addRoleName)
                          ?.label ?? addRoleName}
                      </div>
                    </div>
                  )}

                  {/* Position */}
                  <ComboboxField
                    label='Position'
                    required
                    placeholder='Select or type a position…'
                    searchPlaceholder='Search positions…'
                    emptyMessage='Type a custom position.'
                    options={POSITION_OPTIONS}
                    value={addPosition || null}
                    onChange={(val) => {
                      setAddPosition(val ?? '');
                      setAddErrors((e) => ({ ...e, position: undefined }));
                    }}
                    error={addErrors.position}
                  />

                  <div className='flex items-center gap-2 pt-1'>
                    <Button
                      type='button'
                      size='sm'
                      className='cursor-pointer'
                      disabled={isAssigning}
                      onClick={isEdit ? handleAssignInEdit : handleAddPending}
                    >
                      {isAssigning ? 'Assigning…' : 'Assign'}
                    </Button>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='cursor-pointer'
                      disabled={isAssigning}
                      onClick={resetAddRow}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Pending list (create mode) */}
              {!isEdit && pendingMembers.length > 0 && (
                <div className='space-y-2'>
                  {pendingMembers.map((pm) => (
                    <div
                      key={pm.key}
                      className='border-border flex items-center justify-between rounded-lg border px-3 py-2.5'
                    >
                      <div>
                        <div className='flex items-center gap-2'>
                          <p className='text-foreground text-sm font-medium'>
                            {pm.name}
                          </p>
                          <span className='bg-muted text-muted-foreground border-border inline-flex items-center rounded border px-1.5 py-0.5 text-xs'>
                            {pm.role_label}
                          </span>
                        </div>
                        <p className='text-muted-foreground mt-0.5 text-xs'>
                          {pm.position}
                        </p>
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='text-destructive hover:text-destructive size-8 cursor-pointer'
                        onClick={() => removePending(pm.key)}
                      >
                        <XIcon className='size-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Current members (edit mode) */}
              {isEdit && members.length > 0 && (
                <div className='space-y-2'>
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className='border-border flex items-center justify-between rounded-lg border px-3 py-2.5'
                    >
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2'>
                          <p className='text-foreground text-sm font-medium'>
                            {member.name}
                          </p>
                          {member.role && (
                            <span className='bg-muted text-muted-foreground border-border inline-flex items-center rounded border px-1.5 py-0.5 text-xs'>
                              {member.role.label}
                            </span>
                          )}
                        </div>
                        <p className='text-muted-foreground mt-0.5 truncate text-xs'>
                          {member.email} · {member.position}
                        </p>
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='text-destructive hover:text-destructive ml-2 size-8 shrink-0 cursor-pointer'
                        disabled={removingId === member.id}
                        onClick={() => {
                          setRemovingId(member.id);
                          doRemove({ teamId: team!.id, userId: member.id });
                        }}
                      >
                        {removingId === member.id ? (
                          <span className='size-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                        ) : (
                          <Trash2Icon className='size-4' />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {(isEdit ? members.length === 0 : pendingMembers.length === 0) &&
                !showAddRow && (
                  <div className='flex flex-col items-center justify-center py-6 text-center'>
                    <UsersIcon className='text-muted-foreground/40 mb-2 size-8' />
                    <p className='text-muted-foreground text-sm'>
                      No members assigned yet.
                    </p>
                    <p className='text-muted-foreground mt-1 text-xs'>
                      Use &quot;Add member&quot; to assign staff to this team.
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>

          {isEdit && team && (
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Team Details</CardTitle>
              </CardHeader>
              <CardContent className='flex flex-wrap gap-6 text-sm'>
                <div className='flex flex-col gap-0.5'>
                  <span className='text-muted-foreground text-xs'>Members</span>
                  <span className='text-foreground font-medium'>
                    {members.length}
                  </span>
                </div>
                <div className='flex flex-col gap-0.5'>
                  <span className='text-muted-foreground text-xs'>Created</span>
                  <span className='text-foreground font-medium'>
                    {new Date(team.timestamps.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className='flex flex-col gap-0.5'>
                  <span className='text-muted-foreground text-xs'>Updated</span>
                  <span className='text-foreground font-medium'>
                    {new Date(team.timestamps.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Actions ── */}
          <div className='flex justify-end gap-3'>
            <Button
              type='button'
              variant='outline'
              className='cursor-pointer'
              disabled={loading}
              onClick={() => router.push(ROUTES.ADMIN.MODULES.TEAMS.LIST)}
            >
              Cancel
            </Button>
            <Button type='submit' className='cursor-pointer' disabled={loading}>
              {loading
                ? isEdit
                  ? 'Saving…'
                  : 'Creating…'
                : isEdit
                  ? 'Save Changes'
                  : 'Create Team'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
