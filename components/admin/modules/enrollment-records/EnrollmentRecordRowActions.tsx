'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  CalendarIcon,
  CircleCheckIcon,
  ClipboardCopyIcon,
  EyeIcon,
  MoreHorizontalIcon,
  StickyNoteIcon,
  UserCogIcon,
  XCircleIcon,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { toast } from 'sonner';

import {
  clearCareTeamFieldErrors,
  validateCareTeamRows,
} from '@/components/admin/modules/enrollmentCareTeamValidation';
import EnrollmentCareTeamEditorDialog, {
  type EnrollmentCareTeamRow,
} from '@/components/admin/modules/enrollment-records/EnrollmentCareTeamEditorDialog';
import type { ComboboxOption } from '@/components/shared/form/ComboBoxField';
import EnrollmentNotesEditorDialog from '@/components/admin/modules/enrollment-records/EnrollmentNotesEditorDialog';
import EnrollmentScheduleEditorDialog from '@/components/admin/modules/enrollment-records/EnrollmentScheduleEditorDialog';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { base } from '@/config/api/base';
import { ENDPOINTS } from '@/config/api/endpoints';
import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints/lookup';
import { ROUTES } from '@/config/routes';
import {
  getEnrollmentRecordById,
  patchEnrollmentCareTeam,
  patchEnrollmentNotes,
  patchEnrollmentSchedule,
  postEnrollmentCancel,
  postEnrollmentComplete,
} from '@/domains/enrollment-records/services';
import type { AdminEnrollment } from '@/domains/enrollment-records/types/admin';
import type { TeamMember } from '@/domains/lookup/types/team-members';
import { http } from '@/lib/api/client';
import { getInitials } from '@/lib/utils/string';

const LIST_QUERY_KEY = [
  'table',
  ENDPOINTS.ADMIN.MODULES.ENROLLMENT_RECORDS.LIST,
] as const;

const viewDetailButtonClass =
  'normal-case bg-background hover:bg-muted text-foreground h-9 shrink-0 gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold';

const moreTriggerClass =
  'bg-background hover:bg-muted text-foreground/80 size-9 shrink-0 rounded-md border-neutral-300';

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

function getEnrollmentReference(enrollment: AdminEnrollment): string {
  const code = enrollment.code?.trim();
  if (code) return code;
  return `#${enrollment.id}`;
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

function newTeamRow(): EnrollmentCareTeamRow {
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
    const position = typeof o.position === 'string' ? o.position.trim() : '';
    if (Number.isFinite(uid) && uid > 0 && position)
      out.push({ user_id: uid, position });
  }
  return out;
}

function rosterToRows(
  roster: Array<{ user_id: number; position: string }>,
): EnrollmentCareTeamRow[] {
  if (roster.length === 0) return [newTeamRow()];
  return roster.map((m) => ({
    ...newTeamRow(),
    userId: String(m.user_id),
    position: m.position,
  }));
}

type ConfirmKind = 'complete' | 'cancel' | null;

export type EnrollmentRecordRowActionsProps = {
  row: AdminEnrollment;
};

export default function EnrollmentRecordRowActions({
  row,
}: EnrollmentRecordRowActionsProps) {
  const queryClient = useQueryClient();
  const status = normalizeStatus(row.status);
  const mutable = isEnrollmentMutable(row.status);
  const isActive = status === 'active';
  const referenceText = getEnrollmentReference(row);

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

  const [teamRows, setTeamRows] = React.useState<EnrollmentCareTeamRow[]>([
    newTeamRow(),
  ]);
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
    patch: Partial<Pick<EnrollmentCareTeamRow, 'userId' | 'position'>>,
  ) => {
    setTeamRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
    setCareErrors((prev) => {
      const n = { ...prev };
      delete n.team_members;
      delete n[`row_${index}`];
      delete n[`position_${index}`];
      delete n[`team_members.${index}.user_id`];
      delete n[`team_members.${index}.position`];
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
      if (e.message === '__VALIDATION__' || e.message === '__FIELD_ERRORS__') {
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
    const next = validateCareTeamRows(teamRows);
    setCareErrors((prev) => {
      const cleared = clearCareTeamFieldErrors(prev);
      return { ...cleared, ...next };
    });
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
        kind === 'complete'
          ? await postEnrollmentComplete(row.id)
          : await postEnrollmentCancel(row.id);
      if (res.status === 'error') {
        throw new Error(res.message ?? 'Action failed.');
      }
      return { kind, data: res.data };
    },
    onSuccess: ({ kind }) => {
      const msg =
        kind === 'complete'
          ? 'Enrollment marked as complete.'
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

  const handleCopyReference = () => {
    void (async () => {
      try {
        await navigator.clipboard.writeText(referenceText);
        toast.success('Reference copied to clipboard.');
      } catch {
        toast.error('Could not copy reference.');
      }
    })();
  };

  return (
    <>
      <div className='flex items-center justify-end gap-1.5'>
        <Button
          variant='outline'
          size='sm'
          className={viewDetailButtonClass}
          asChild
        >
          <Link
            href={ROUTES.ADMIN.MODULES.ENROLLMENT_RECORDS.DETAIL(
              String(row.id),
            )}
            className='inline-flex items-center gap-1.5'
          >
            <EyeIcon className='size-3.5 shrink-0' />
            View detail
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type='button'
              variant='outline'
              size='icon'
              className={moreTriggerClass}
              aria-label='More actions'
            >
              <MoreHorizontalIcon className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='min-w-52'>
            <DropdownMenuLabel className='text-foreground/70 space-y-1 px-2 py-1.5 text-[11px]! font-bold tracking-wide uppercase'>
              More Options
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='flex cursor-pointer items-center gap-2 text-[13px]! font-medium'
              onClick={handleCopyReference}
            >
              <ClipboardCopyIcon className='size-3.5 shrink-0' />
              Copy reference
            </DropdownMenuItem>
            {mutable ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='flex cursor-pointer items-center gap-2 text-[13px]! font-medium'
                  onClick={() => setScheduleOpen(true)}
                >
                  <CalendarIcon className='size-3.5 shrink-0' />
                  Edit schedule
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='flex cursor-pointer items-center gap-2 text-[13px]! font-medium'
                  onClick={() => setNotesOpen(true)}
                >
                  <StickyNoteIcon className='size-3.5 shrink-0' />
                  Edit notes
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='flex cursor-pointer items-center gap-2 text-[13px]! font-medium'
                  onClick={() => setCareTeamOpen(true)}
                >
                  <UserCogIcon className='size-3.5 shrink-0' />
                  Edit care team
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isActive ? (
                  <DropdownMenuItem
                    className='flex cursor-pointer items-center gap-2 text-[13px]! font-medium'
                    onClick={() => setConfirm({ kind: 'complete', row })}
                  >
                    <CircleCheckIcon className='size-3.5 shrink-0' />
                    Mark as complete
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem
                  className='text-destructive focus:text-destructive flex cursor-pointer items-center gap-2 text-[13px]! font-medium'
                  onClick={() => setConfirm({ kind: 'cancel', row })}
                >
                  <XCircleIcon className='text-destructive size-3.5 shrink-0' />
                  Cancel enrollment
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EnrollmentScheduleEditorDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        isActive={isActive}
        rowId={row.id}
        rowStartsAt={row.starts_at}
        startsAt={startsAt}
        setStartsAt={setStartsAt}
        endsAt={endsAt}
        setEndsAt={setEndsAt}
        scheduleErrors={scheduleErrors}
        setScheduleErrors={setScheduleErrors}
        schedulePending={schedulePending}
        onSubmit={handleScheduleSubmit}
      />

      <EnrollmentNotesEditorDialog
        open={notesOpen}
        onOpenChange={setNotesOpen}
        notesBody={notesBody}
        setNotesBody={setNotesBody}
        notesError={notesError}
        setNotesError={setNotesError}
        notesPending={notesPending}
        onSubmit={handleNotesSubmit}
      />

      <EnrollmentCareTeamEditorDialog
        open={careTeamOpen}
        onOpenChange={setCareTeamOpen}
        detailLoading={detailLoading}
        detailError={detailError}
        detailQueryError={detailQueryError}
        teamRows={teamRows}
        setTeamRows={setTeamRows}
        careErrors={careErrors}
        setCareErrors={setCareErrors}
        teamLoading={teamLoading}
        optionsForTeamRow={optionsForTeamRow}
        updateTeamRow={updateTeamRow}
        carePending={carePending}
        onSubmit={handleCareSubmit}
        onAddMember={() => setTeamRows((r) => [...r, newTeamRow()])}
      />

      <AlertDialog
        open={confirm != null}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.kind === 'complete'
                ? 'Mark enrollment as complete?'
                : 'Cancel enrollment?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.kind === 'complete'
                ? 'This sets the enrollment to completed. Use this when the participant has finished the program and you are recording completion manually.'
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
                : confirm?.kind === 'complete'
                  ? 'Mark as complete'
                  : 'Cancel enrollment'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
