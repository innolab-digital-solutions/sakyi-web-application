'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  CalendarIcon,
  CheckCircle2Icon,
  MoreHorizontalIcon,
  PlayIcon,
  StickyNoteIcon,
  Trash2Icon,
  UserCogIcon,
  XCircleIcon,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { toast } from 'sonner';

import ComboboxField, {
  type ComboboxOption,
} from '@/components/shared/form/ComboBoxField';
import TextAreaField from '@/components/shared/form/TextAreaField';
import TextField from '@/components/shared/form/TextField';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { base } from '@/config/api/base';
import { ENDPOINTS } from '@/config/api/endpoints';
import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints/lookup';
import { ROUTES } from '@/config/routes';
import type { AdminEnrollment } from '@/domains/enrollment-records/types/admin';
import {
  getEnrollmentRecordById,
  patchEnrollmentCareTeam,
  patchEnrollmentNotes,
  patchEnrollmentSchedule,
  postEnrollmentActivate,
  postEnrollmentCancel,
  postEnrollmentComplete,
} from '@/domains/enrollment-records/services';
import type { TeamMember } from '@/domains/lookup/types/team-members';
import { http } from '@/lib/api/client';
import { getInitials } from '@/lib/utils/string';

const LIST_QUERY_KEY = [
  'table',
  ENDPOINTS.ADMIN.MODULES.ENROLLMENT_RECORDS.LIST,
] as const;

function normalizeStatus(status: string | undefined): string {
  return (status ?? '').trim().toLowerCase();
}

function isEnrollmentMutable(status: string | undefined): boolean {
  const s = normalizeStatus(status);
  return s === 'scheduled' || s === 'active';
}

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso?.trim()) return '';
  try {
    return format(parseISO(iso.trim()), 'yyyy-MM-dd');
  } catch {
    return '';
  }
}

function flattenApiErrors(
  raw: Record<string, unknown> | undefined,
): Record<string, string> {
  if (!raw) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'string') out[k] = v;
    else if (Array.isArray(v) && v.length > 0) {
      const first = v[0];
      out[k] = typeof first === 'string' ? first : String(first);
    } else if (v != null) out[k] = String(v);
  }
  return out;
}

function resolveTeamMemberPictureUrl(
  raw: string | null | undefined,
): string | undefined {
  if (!raw?.trim()) return undefined;
  const t = raw.trim();
  if (t.startsWith('http')) return t;
  return `${base.domainEndpoint}${t}`;
}

type TeamRow = {
  key: string;
  userId: string;
  position: string;
};

function newTeamRow(): TeamRow {
  return {
    key:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
    userId: '',
    position: '',
  };
}

function rosterFromEnrollment(
  e: AdminEnrollment,
): Array<{ user_id: number; position: string }> {
  const raw = e.team_members;
  if (!Array.isArray(raw) || raw.length === 0) return [];
  const out: Array<{ user_id: number; position: string }> = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const o = entry as Record<string, unknown>;
    let uid = NaN;
    if (typeof o.user_id === 'number') uid = o.user_id;
    else if (typeof o.user_id === 'string')
      uid = Number.parseInt(o.user_id, 10);
    else if (o.user && typeof o.user === 'object') {
      const id = (o.user as { id?: unknown }).id;
      if (typeof id === 'number') uid = id;
    }
    const position =
      typeof o.position === 'string' ? o.position.trim() : '';
    if (Number.isFinite(uid) && uid > 0 && position)
      out.push({ user_id: uid, position });
  }
  return out;
}

function rosterToRows(
  roster: Array<{ user_id: number; position: string }>,
): TeamRow[] {
  if (roster.length === 0) return [newTeamRow()];
  return roster.map((m) => ({
    ...newTeamRow(),
    userId: String(m.user_id),
    position: m.position,
  }));
}

type ConfirmKind = 'activate' | 'complete' | 'cancel' | null;

export type EnrollmentRecordRowActionsProps = {
  row: AdminEnrollment;
};

export default function EnrollmentRecordRowActions({
  row,
}: EnrollmentRecordRowActionsProps) {
  const queryClient = useQueryClient();
  const status = normalizeStatus(row.status);
  const mutable = isEnrollmentMutable(row.status);
  const isScheduled = status === 'scheduled';
  const isActive = status === 'active';

  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [notesOpen, setNotesOpen] = React.useState(false);
  const [careTeamOpen, setCareTeamOpen] = React.useState(false);
  const [confirm, setConfirm] = React.useState<{
    kind: Exclude<ConfirmKind, null>;
    row: AdminEnrollment;
  } | null>(null);

  const [startsAt, setStartsAt] = React.useState('');
  const [endsAt, setEndsAt] = React.useState('');
  const [scheduleErrors, setScheduleErrors] = React.useState<
    Record<string, string>
  >({});

  const [notesBody, setNotesBody] = React.useState('');
  const [notesError, setNotesError] = React.useState<string | undefined>();

  const [teamRows, setTeamRows] = React.useState<TeamRow[]>([newTeamRow()]);
  const [careErrors, setCareErrors] = React.useState<Record<string, string>>(
    {},
  );

  const invalidateList = React.useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [...LIST_QUERY_KEY] });
  }, [queryClient]);

  React.useEffect(() => {
    if (!scheduleOpen) return;
    setStartsAt(toDateInputValue(row.starts_at));
    setEndsAt(toDateInputValue(row.ends_at));
    setScheduleErrors({});
  }, [scheduleOpen, row.id, row.starts_at, row.ends_at]);

  React.useEffect(() => {
    if (!notesOpen) return;
    setNotesBody(row.notes?.trim() ?? '');
    setNotesError(undefined);
  }, [notesOpen, row.id, row.notes]);

  const { data: teamMembers = [], isLoading: teamLoading } = useQuery({
    queryKey: ['lookup', LOOKUP_ENDPOINTS.TEAM_MEMBERS],
    queryFn: async () => {
      const res = await http.get<TeamMember[]>(LOOKUP_ENDPOINTS.TEAM_MEMBERS);
      return res.status === 'success' ? res.data : [];
    },
    enabled: careTeamOpen,
  });

  const {
    data: detailEnrollment,
    isLoading: detailLoading,
    isError: detailError,
    error: detailQueryError,
  } = useQuery({
    queryKey: ['enrollment-record', row.id, 'care-team'],
    queryFn: async () => {
      const res = await getEnrollmentRecordById(row.id);
      if (res.status === 'error') {
        throw new Error(res.message || 'Could not load enrollment.');
      }
      return res.data;
    },
    enabled: careTeamOpen,
  });

  React.useEffect(() => {
    if (!careTeamOpen || !detailEnrollment) return;
    const roster = rosterFromEnrollment(detailEnrollment);
    setTeamRows(rosterToRows(roster));
    setCareErrors({});
  }, [careTeamOpen, detailEnrollment]);

  const clientId = row.client?.id;

  const optionsForTeamRow = React.useCallback(
    (rowIndex: number): ComboboxOption[] => {
      const taken = new Set<number>();
      for (let i = 0; i < teamRows.length; i++) {
        if (i === rowIndex) continue;
        const uid = teamRows[i]?.userId;
        if (uid) taken.add(Number.parseInt(uid, 10));
      }
      return teamMembers
        .filter(
          (m) =>
            m.id !== clientId &&
            (!taken.has(m.id) || teamRows[rowIndex]?.userId === String(m.id)),
        )
        .map((m) => {
          const pic = resolveTeamMemberPictureUrl(m.picture);
          return {
            value: String(m.id),
            label: m.name,
            keywords: [m.email, m.role ?? '', String(m.id)].filter(Boolean),
            content: (
              <div className='flex items-center gap-2'>
                <Avatar size='sm' className='size-7 shrink-0'>
                  {pic ? <AvatarImage src={pic} alt='' /> : null}
                  <AvatarFallback className='text-[10px]'>
                    {getInitials(m.name, 2) || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className='min-w-0 flex-1 truncate text-left'>
                  <span className='font-medium'>{m.name}</span>
                  <span className='text-muted-foreground block truncate text-xs'>
                    {m.email}
                  </span>
                </span>
              </div>
            ),
          };
        });
    },
    [teamMembers, teamRows, clientId],
  );

  const updateTeamRow = (
    index: number,
    patch: Partial<Pick<TeamRow, 'userId' | 'position'>>,
  ) => {
    setTeamRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
    setCareErrors((prev) => {
      const n = { ...prev };
      delete n.team_members;
      delete n[`row_${index}`];
      delete n[`position_${index}`];
      return n;
    });
  };

  const { mutate: mutateSchedule, isPending: schedulePending } = useMutation({
    mutationFn: async () => {
      if (isActive) {
        const body = { ends_at: endsAt.trim() ? endsAt.trim() : null };
        const res = await patchEnrollmentSchedule(row.id, body);
        if (res.status === 'error') {
          const flat = flattenApiErrors(res.errors);
          if (Object.keys(flat).length > 0) {
            setScheduleErrors(flat);
            throw new Error('__FIELD_ERRORS__');
          }
          throw new Error(res.message ?? 'Could not update schedule.');
        }
        return res.data;
      }
      if (!startsAt.trim()) {
        setScheduleErrors({ starts_at: 'Start date is required.' });
        throw new Error('__VALIDATION__');
      }
      if (endsAt.trim() && startsAt.trim() && endsAt < startsAt) {
        setScheduleErrors({
          ends_at: 'End date must be on or after the start date.',
        });
        throw new Error('__VALIDATION__');
      }
      const res = await patchEnrollmentSchedule(row.id, {
        starts_at: startsAt.trim(),
        ends_at: endsAt.trim() ? endsAt.trim() : null,
      });
      if (res.status === 'error') {
        const flat = flattenApiErrors(res.errors);
        if (Object.keys(flat).length > 0) {
          setScheduleErrors(flat);
          throw new Error('__FIELD_ERRORS__');
        }
        throw new Error(res.message ?? 'Could not update schedule.');
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success('Schedule updated.');
      setScheduleOpen(false);
      invalidateList();
    },
    onError: (e: Error) => {
      if (
        e.message === '__VALIDATION__' ||
        e.message === '__FIELD_ERRORS__'
      ) {
        return;
      }
      toast.error(e.message ?? 'Could not update schedule.');
    },
  });

  const { mutate: mutateNotes, isPending: notesPending } = useMutation({
    mutationFn: async () => {
      const res = await patchEnrollmentNotes(row.id, {
        notes: notesBody.trim() === '' ? null : notesBody.trim(),
      });
      if (res.status === 'error') {
        const flat = flattenApiErrors(res.errors);
        setNotesError(flat.notes ?? res.message ?? 'Could not save notes.');
        throw new Error('__FIELD_ERRORS__');
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success('Notes saved.');
      setNotesOpen(false);
      invalidateList();
    },
    onError: (e: Error) => {
      if (e.message === '__FIELD_ERRORS__') return;
      toast.error(e.message ?? 'Could not save notes.');
    },
  });

  const validateCareTeam = (): boolean => {
    const next: Record<string, string> = {};
    const payload = teamRows
      .filter((r) => r.userId.trim() && r.position.trim())
      .map((r) => ({
        user_id: Number.parseInt(r.userId, 10),
        position: r.position.trim(),
      }));
    if (payload.length === 0) {
      next.team_members = 'Add at least one team member with role.';
    } else {
      for (let i = 0; i < teamRows.length; i++) {
        const r = teamRows[i];
        const hasUser = Boolean(r.userId?.trim());
        const hasPos = Boolean(r.position.trim());
        if (hasUser !== hasPos) {
          next[`row_${i}`] = 'Select a staff member and enter a position.';
        }
        if (r.position.trim().length > 50) {
          next[`position_${i}`] = 'Position must be at most 50 characters.';
        }
      }
      const ids = payload.map((p) => p.user_id);
      if (new Set(ids).size !== ids.length) {
        next.team_members = 'Each staff member can only be assigned once.';
      }
    }
    setCareErrors(next);
    return Object.keys(next).length === 0;
  };

  const { mutate: mutateCareTeam, isPending: carePending } = useMutation({
    mutationFn: async () => {
      const payload = teamRows
        .filter((r) => r.userId.trim() && r.position.trim())
        .map((r) => ({
          user_id: Number.parseInt(r.userId, 10),
          position: r.position.trim(),
        }));
      const res = await patchEnrollmentCareTeam(row.id, {
        team_members: payload,
      });
      if (res.status === 'error') {
        const flat = flattenApiErrors(res.errors);
        if (Object.keys(flat).length > 0) {
          setCareErrors(flat);
          throw new Error('__FIELD_ERRORS__');
        }
        throw new Error(res.message ?? 'Could not update care team.');
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success('Care team updated.');
      setCareTeamOpen(false);
      invalidateList();
      void queryClient.invalidateQueries({
        queryKey: ['enrollment-record', row.id],
      });
      void queryClient.invalidateQueries({
        queryKey: ['enrollment-record', row.id, 'care-team'],
      });
    },
    onError: (e: Error) => {
      if (e.message === '__FIELD_ERRORS__') return;
      toast.error(e.message ?? 'Could not update care team.');
    },
  });

  const { mutate: mutateLifecycle, isPending: lifecyclePending } = useMutation({
    mutationFn: async (kind: Exclude<ConfirmKind, null>) => {
      const res =
        kind === 'activate'
          ? await postEnrollmentActivate(row.id)
          : kind === 'complete'
            ? await postEnrollmentComplete(row.id)
            : await postEnrollmentCancel(row.id);
      if (res.status === 'error') {
        throw new Error(res.message ?? 'Action failed.');
      }
      return { kind, data: res.data };
    },
    onSuccess: ({ kind }) => {
      const msg =
        kind === 'activate'
          ? 'Enrollment activated.'
          : kind === 'complete'
            ? 'Enrollment completed.'
            : 'Enrollment cancelled.';
      toast.success(msg);
      setConfirm(null);
      invalidateList();
    },
    onError: (e: Error) => {
      toast.error(e.message ?? 'Action failed.');
    },
  });

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleErrors({});
    mutateSchedule();
  };

  const handleNotesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotesError(undefined);
    mutateNotes();
  };

  const handleCareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCareTeam()) return;
    mutateCareTeam();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='h-9 gap-1 rounded-md px-2 text-[13px] font-semibold'
            aria-label='Row actions'
          >
            <MoreHorizontalIcon className='size-4' />
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='min-w-48'>
          <DropdownMenuItem asChild className='cursor-pointer'>
            <Link
              href={ROUTES.ADMIN.MODULES.ENROLLMENT_RECORDS.DETAIL(
                String(row.id),
              )}
            >
              View detail
            </Link>
          </DropdownMenuItem>
          {mutable ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='flex cursor-pointer items-center gap-2'
                onClick={() => setScheduleOpen(true)}
              >
                <CalendarIcon className='size-3.5 shrink-0' />
                Edit schedule
              </DropdownMenuItem>
              <DropdownMenuItem
                className='flex cursor-pointer items-center gap-2'
                onClick={() => setNotesOpen(true)}
              >
                <StickyNoteIcon className='size-3.5 shrink-0' />
                Edit notes
              </DropdownMenuItem>
              <DropdownMenuItem
                className='flex cursor-pointer items-center gap-2'
                onClick={() => setCareTeamOpen(true)}
              >
                <UserCogIcon className='size-3.5 shrink-0' />
                Edit care team
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isScheduled ? (
                <DropdownMenuItem
                  className='flex cursor-pointer items-center gap-2'
                  onClick={() =>
                    setConfirm({ kind: 'activate', row })
                  }
                >
                  <PlayIcon className='size-3.5 shrink-0' />
                  Activate
                </DropdownMenuItem>
              ) : null}
              {isActive ? (
                <DropdownMenuItem
                  className='flex cursor-pointer items-center gap-2'
                  onClick={() =>
                    setConfirm({ kind: 'complete', row })
                  }
                >
                  <CheckCircle2Icon className='size-3.5 shrink-0' />
                  Mark complete
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                className='text-destructive focus:text-destructive flex cursor-pointer items-center gap-2'
                onClick={() => setConfirm({ kind: 'cancel', row })}
              >
                <XCircleIcon className='size-3.5 shrink-0' />
                Cancel enrollment
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Update schedule</DialogTitle>
            <DialogDescription className='text-muted-foreground text-sm font-medium'>
              {isActive
                ? 'For active enrollments only the end date can be changed. Start date is locked.'
                : 'Adjust start and optional end dates while the enrollment is scheduled or active.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleScheduleSubmit} className='space-y-4'>
            {isActive ? (
              <div className='space-y-1.5'>
                <Label className='text-sm font-semibold'>Start date (locked)</Label>
                <p className='text-foreground text-sm tabular-nums'>
                  {toDateInputValue(row.starts_at) || '—'}
                </p>
              </div>
            ) : (
              <div className='space-y-1.5'>
                <Label htmlFor={`sch-start-${row.id}`} className='text-sm font-semibold'>
                  Start date <span className='text-destructive'>*</span>
                </Label>
                <input
                  id={`sch-start-${row.id}`}
                  type='date'
                  value={startsAt}
                  onChange={(e) => {
                    setStartsAt(e.target.value);
                    setScheduleErrors((p) => {
                      const n = { ...p };
                      delete n.starts_at;
                      return n;
                    });
                  }}
                  className='border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
                />
                {scheduleErrors.starts_at ? (
                  <p className='text-destructive text-xs font-medium'>
                    {scheduleErrors.starts_at}
                  </p>
                ) : null}
              </div>
            )}
            <div className='space-y-1.5'>
              <Label htmlFor={`sch-end-${row.id}`} className='text-sm font-semibold'>
                End date
              </Label>
              <input
                id={`sch-end-${row.id}`}
                type='date'
                value={endsAt}
                min={
                  (isActive ? toDateInputValue(row.starts_at) : startsAt) ||
                  undefined
                }
                onChange={(e) => {
                  setEndsAt(e.target.value);
                  setScheduleErrors((p) => {
                    const n = { ...p };
                    delete n.ends_at;
                    return n;
                  });
                }}
                className='border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
              />
              {scheduleErrors.ends_at ? (
                <p className='text-destructive text-xs font-medium'>
                  {scheduleErrors.ends_at}
                </p>
              ) : null}
            </div>
            {scheduleErrors.status ? (
              <p className='text-destructive text-xs font-medium'>
                {scheduleErrors.status}
              </p>
            ) : null}
            <DialogFooter className='gap-2 sm:gap-0'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setScheduleOpen(false)}
              >
                Close
              </Button>
              <Button type='submit' disabled={schedulePending}>
                {schedulePending ? 'Saving…' : 'Save schedule'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Edit notes</DialogTitle>
            <DialogDescription className='text-muted-foreground text-sm font-medium'>
              Notes are optional. Leave empty and save to clear.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNotesSubmit} className='space-y-4'>
            <TextAreaField
              label='Notes'
              value={notesBody}
              onChange={(e) => {
                setNotesBody(e.target.value);
                setNotesError(undefined);
              }}
              rows={5}
              error={notesError}
            />
            <DialogFooter className='gap-2 sm:gap-0'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setNotesOpen(false)}
              >
                Close
              </Button>
              <Button type='submit' disabled={notesPending}>
                {notesPending ? 'Saving…' : 'Save notes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={careTeamOpen} onOpenChange={setCareTeamOpen}>
        <DialogContent className='max-h-[90vh] max-w-lg overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Edit care team</DialogTitle>
            <DialogDescription className='text-muted-foreground text-sm font-medium'>
              Replaces the full roster. At least one staff member with a role is
              required. The enrolled client cannot be assigned as staff.
            </DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <p className='text-muted-foreground text-sm'>Loading roster…</p>
          ) : detailError ? (
            <p className='text-destructive text-sm'>
              {detailQueryError instanceof Error
                ? detailQueryError.message
                : 'Could not load roster.'}
            </p>
          ) : (
            <form onSubmit={handleCareSubmit} className='space-y-4'>
              <div className='flex justify-end'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='h-8 gap-1 text-xs font-semibold'
                  onClick={() => setTeamRows((r) => [...r, newTeamRow()])}
                >
                  Add member
                </Button>
              </div>
              {careErrors.team_members ? (
                <p className='text-destructive text-xs font-medium'>
                  {careErrors.team_members}
                </p>
              ) : null}
              {teamRows.map((tr, index) => (
                <div
                  key={tr.key}
                  className='border-border space-y-3 rounded-md border bg-muted/20 p-3'
                >
                  <div className='flex items-start justify-between gap-2'>
                    <span className='text-muted-foreground text-xs font-semibold'>
                      Member {index + 1}
                    </span>
                    {teamRows.length > 1 ? (
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='text-destructive hover:text-destructive size-8'
                        aria-label='Remove member'
                        onClick={() => {
                          setTeamRows((prev) =>
                            prev.filter((_, i) => i !== index),
                          );
                          setCareErrors((p) => {
                            const n = { ...p };
                            delete n.team_members;
                            return n;
                          });
                        }}
                      >
                        <Trash2Icon className='size-4' />
                      </Button>
                    ) : null}
                  </div>
                  <ComboboxField
                    label='Staff'
                    required
                    placeholder={
                      teamLoading ? 'Loading team…' : 'Select team member'
                    }
                    disabled={teamLoading}
                    options={optionsForTeamRow(index)}
                    value={tr.userId}
                    onChange={(val) =>
                      updateTeamRow(index, {
                        userId: val != null ? val : '',
                      })
                    }
                    emptyMessage='No team members found.'
                    searchPlaceholder='Search by name or email'
                    error={
                      careErrors[`team_members.${index}.user_id`] ||
                      careErrors[`row_${index}`]
                    }
                  />
                  <TextField
                    label='Position'
                    required
                    placeholder='e.g. Lead coach'
                    maxLength={50}
                    value={tr.position}
                    onChange={(e) =>
                      updateTeamRow(index, { position: e.target.value })
                    }
                    error={
                      careErrors[`team_members.${index}.position`] ||
                      careErrors[`position_${index}`]
                    }
                  />
                </div>
              ))}
              <DialogFooter className='gap-2 sm:gap-0'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setCareTeamOpen(false)}
                >
                  Close
                </Button>
                <Button type='submit' disabled={carePending}>
                  {carePending ? 'Saving…' : 'Save care team'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirm != null}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.kind === 'activate'
                ? 'Activate enrollment?'
                : confirm?.kind === 'complete'
                  ? 'Mark enrollment complete?'
                  : 'Cancel enrollment?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.kind === 'activate'
                ? 'This moves the record from scheduled to active. The start date must be today or in the past for the server to accept it.'
                : confirm?.kind === 'complete'
                  ? 'This marks the enrollment as completed. This action is intended for manual completion while the enrollment is active.'
                  : 'This stops the enrollment before completion. Scheduled or active enrollments can be cancelled.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={lifecyclePending}>
              Back
            </AlertDialogCancel>
            <Button
              type='button'
              variant={confirm?.kind === 'cancel' ? 'destructive' : 'default'}
              disabled={lifecyclePending}
              onClick={() => {
                if (confirm) mutateLifecycle(confirm.kind);
              }}
            >
              {lifecyclePending
                ? 'Working…'
                : confirm?.kind === 'activate'
                  ? 'Activate'
                  : confirm?.kind === 'complete'
                    ? 'Mark complete'
                    : 'Cancel enrollment'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
