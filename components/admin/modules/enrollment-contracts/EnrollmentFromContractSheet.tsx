'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, Trash2Icon, UserPlusIcon } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import ComboboxField, {
  type ComboboxOption,
} from '@/components/shared/form/ComboBoxField';
import TextAreaField from '@/components/shared/form/TextAreaField';
import TextField from '@/components/shared/form/TextField';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { base } from '@/config/api/base';
import { ENDPOINTS } from '@/config/api/endpoints';
import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints/lookup';
import { createEnrollment } from '@/domains/enrollment-records/services';
import type { EnrollmentContract } from '@/domains/enrollment-contracts/types';
import type { TeamMember } from '@/domains/lookup/types/team-members';
import { http } from '@/lib/api/client';
import { getInitials } from '@/lib/utils/string';

function resolveTeamMemberPictureUrl(
  raw: string | null | undefined,
): string | undefined {
  if (!raw?.trim()) return undefined;
  const t = raw.trim();
  if (t.startsWith('http')) return t;
  return `${base.domainEndpoint}${t}`;
}

type TeamMemberRow = {
  key: string;
  userId: string;
  position: string;
};

function newRow(): TeamMemberRow {
  return {
    key:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
    userId: '',
    position: '',
  };
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

export type EnrollmentFromContractSheetProps = {
  contract: EnrollmentContract | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function EnrollmentFromContractSheet({
  contract,
  open,
  onOpenChange,
}: EnrollmentFromContractSheetProps) {
  const queryClient = useQueryClient();
  const [startsAt, setStartsAt] = React.useState('');
  const [endsAt, setEndsAt] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [rows, setRows] = React.useState<TeamMemberRow[]>([newRow()]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const { data: teamMembers = [], isLoading: teamMembersLoading } = useQuery({
    queryKey: ['lookup', LOOKUP_ENDPOINTS.TEAM_MEMBERS],
    queryFn: async () => {
      const res = await http.get<TeamMember[]>(LOOKUP_ENDPOINTS.TEAM_MEMBERS);
      return res.status === 'success' ? res.data : [];
    },
    enabled: open,
  });

  React.useEffect(() => {
    if (!open || !contract) return;
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setStartsAt(`${y}-${m}-${d}`);
    setEndsAt('');
    setNotes('');
    setRows([newRow()]);
    setErrors({});
  }, [open, contract?.id]);

  const optionsForRow = React.useCallback(
    (rowIndex: number): ComboboxOption[] => {
      const taken = new Set<number>();
      for (let i = 0; i < rows.length; i++) {
        if (i === rowIndex) continue;
        const uid = rows[i]?.userId;
        if (uid) taken.add(Number.parseInt(uid, 10));
      }
      return teamMembers
        .filter((m) => !taken.has(m.id) || rows[rowIndex]?.userId === String(m.id))
        .map((m) => {
          const pic = resolveTeamMemberPictureUrl(m.picture);
          return {
            value: String(m.id),
            label: m.name,
            keywords: [m.email, String(m.id)],
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
    [teamMembers, rows],
  );

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!startsAt.trim()) {
      next.starts_at = 'Start date is required.';
    }
    const membersPayload = rows
      .map((r) => ({
        user_id: r.userId ? Number.parseInt(r.userId, 10) : NaN,
        position: r.position.trim(),
      }))
      .filter((r) => !Number.isNaN(r.user_id) && r.position.length > 0);

    if (membersPayload.length === 0) {
      next.team_members = 'Add at least one team member with role.';
    } else {
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const hasUser = Boolean(r.userId?.trim());
        const hasPos = Boolean(r.position.trim());
        if (hasUser !== hasPos) {
          next[`row_${i}`] = 'Select a staff member and enter a position.';
        }
        if (r.position.trim().length > 50) {
          next[`position_${i}`] = 'Position must be at most 50 characters.';
        }
      }
      const ids = membersPayload.map((m) => m.user_id);
      if (new Set(ids).size !== ids.length) {
        next.team_members = 'Each staff member can only be assigned once.';
      }
    }

    if (endsAt.trim() && startsAt.trim() && endsAt < startsAt) {
      next.ends_at = 'End date must be on or after the start date.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!contract) throw new Error('No contract selected.');
      const membersPayload = rows
        .filter((r) => r.userId.trim() && r.position.trim())
        .map((r) => ({
          user_id: Number.parseInt(r.userId, 10),
          position: r.position.trim(),
        }));

      const res = await createEnrollment({
        enrollment_contract_id: contract.id,
        starts_at: startsAt.trim(),
        ends_at: endsAt.trim() ? endsAt.trim() : null,
        notes: notes.trim() || null,
        team_members: membersPayload,
      });

      if (res.status === 'error') {
        const flat = flattenApiErrors(res.errors);
        if (Object.keys(flat).length > 0) {
          setErrors(flat);
          throw new Error('__FIELD_ERRORS__');
        }
        throw new Error(res.message || 'Could not create enrollment.');
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success('Enrollment created.');
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.ENROLLMENT_CONTRACTS.LIST],
      });
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.ENROLLMENT_RECORDS.LIST],
      });
      onOpenChange(false);
    },
    onError: (e: Error) => {
      if (e.message === '__FIELD_ERRORS__') return;
      toast.error(e.message ?? 'Could not create enrollment.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutate();
  };

  const updateRow = (
    index: number,
    patch: Partial<Pick<TeamMemberRow, 'userId' | 'position'>>,
  ) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
    setErrors((prev) => {
      const n = { ...prev };
      delete n.team_members;
      delete n[`row_${index}`];
      delete n[`position_${index}`];
      return n;
    });
  };

  const contractRef = contract?.code?.trim() || `#${contract?.id ?? ''}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex max-h-full flex-col overflow-y-auto px-6 sm:max-w-lg [&>button]:cursor-pointer'>
        <SheetHeader className='px-0'>
          <SheetTitle className='text-foreground text-md font-bold'>
            Create enrollment
          </SheetTitle>
          <SheetDescription className='text-muted-foreground text-sm font-medium'>
            Link care team members to this signed contract. Start and end dates
            apply to the program enrollment; staff each need a role label (for
            example Lead coach).
          </SheetDescription>
        </SheetHeader>

        {contract ? (
          <p className='text-muted-foreground border-border mt-2 rounded-md border bg-muted/40 px-3 py-2 text-xs font-medium'>
            Contract:{' '}
            <span className='text-foreground font-semibold'>{contractRef}</span>
          </p>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className='mt-4 flex min-h-0 flex-1 flex-col gap-5 pb-2'
          noValidate
        >
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label
                htmlFor='enrollment-starts-at'
                className='text-foreground text-sm font-semibold'
              >
                Start date <span className='text-destructive'>*</span>
              </Label>
              <input
                id='enrollment-starts-at'
                type='date'
                value={startsAt}
                onChange={(e) => {
                  setStartsAt(e.target.value);
                  setErrors((p) => {
                    const n = { ...p };
                    delete n.starts_at;
                    return n;
                  });
                }}
                className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
              />
              {errors.starts_at ? (
                <p className='text-destructive text-xs font-medium'>
                  {errors.starts_at}
                </p>
              ) : null}
            </div>
            <div className='space-y-1.5'>
              <Label
                htmlFor='enrollment-ends-at'
                className='text-foreground text-sm font-semibold'
              >
                End date
              </Label>
              <input
                id='enrollment-ends-at'
                type='date'
                value={endsAt}
                min={startsAt || undefined}
                onChange={(e) => {
                  setEndsAt(e.target.value);
                  setErrors((p) => {
                    const n = { ...p };
                    delete n.ends_at;
                    return n;
                  });
                }}
                className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
              />
              {errors.ends_at ? (
                <p className='text-destructive text-xs font-medium'>
                  {errors.ends_at}
                </p>
              ) : null}
            </div>
          </div>

          <TextAreaField
            label='Notes'
            placeholder='Optional internal notes'
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setErrors((p) => {
                const n = { ...p };
                delete n.notes;
                return n;
              });
            }}
            rows={3}
            error={errors.notes}
          />

          <div className='space-y-3'>
            <div className='flex items-center justify-between gap-2'>
              <Label className='text-foreground text-sm font-semibold'>
                Care team <span className='text-destructive'>*</span>
              </Label>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='h-8 gap-1 text-xs font-semibold'
                onClick={() => setRows((r) => [...r, newRow()])}
              >
                <PlusIcon className='size-3.5' />
                Add member
              </Button>
            </div>
            {errors.team_members ? (
              <p className='text-destructive text-xs font-medium'>
                {errors.team_members}
              </p>
            ) : null}

            <div className='space-y-4'>
              {rows.map((row, index) => (
                <div
                  key={row.key}
                  className='border-border space-y-3 rounded-md border bg-muted/20 p-3'
                >
                  <div className='flex items-start justify-between gap-2'>
                    <span className='text-muted-foreground text-xs font-semibold'>
                      Member {index + 1}
                    </span>
                    {rows.length > 1 ? (
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='text-destructive hover:text-destructive size-8 shrink-0'
                        aria-label='Remove member'
                        onClick={() => {
                          setRows((prev) =>
                            prev.filter((_, i) => i !== index),
                          );
                          setErrors((p) => {
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
                      teamMembersLoading
                        ? 'Loading team…'
                        : 'Select team member'
                    }
                    disabled={teamMembersLoading}
                    options={optionsForRow(index)}
                    value={row.userId}
                    onChange={(val) =>
                      updateRow(index, { userId: val != null ? val : '' })
                    }
                    emptyMessage='No team members found.'
                    searchPlaceholder='Search by name or email'
                    error={
                      errors[`team_members.${index}.user_id`] ||
                      errors[`row_${index}`]
                    }
                  />
                  <TextField
                    label='Position'
                    required
                    placeholder='e.g. Lead coach'
                    maxLength={50}
                    value={row.position}
                    onChange={(e) =>
                      updateRow(index, { position: e.target.value })
                    }
                    error={
                      errors[`team_members.${index}.position`] ||
                      errors[`position_${index}`]
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className='border-border mt-auto flex flex-col gap-2 border-t pt-4'>
            <Button
              type='submit'
              disabled={isPending || !contract}
              className='h-10 w-full gap-1.5 rounded-md text-[13px]! font-semibold sm:w-auto'
            >
              <UserPlusIcon className='size-3.5' />
              {isPending ? 'Creating…' : 'Create enrollment'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
