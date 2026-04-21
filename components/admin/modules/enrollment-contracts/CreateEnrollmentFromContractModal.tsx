'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, startOfDay } from 'date-fns';
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

import {
  clearCareTeamFieldErrors,
  validateCareTeamRows,
} from '@/components/admin/modules/enrollmentCareTeamValidation';
import {
  enrollmentWizardDialogContentClass,
  enrollmentWizardDialogFooterClass,
  enrollmentWizardStepBodyCardClass,
  STEP_BODY_HEIGHT_CLASS,
  wizardOutlineButtonClass,
  wizardPrimaryButtonClass,
} from '@/components/admin/modules/enrollmentWizardModalUi';
import ComboboxField, {
  type ComboboxOption,
} from '@/components/shared/form/ComboBoxField';
import DatePickerField from '@/components/shared/form/DatePickerField';
import TextAreaField from '@/components/shared/form/TextAreaField';
import TextField from '@/components/shared/form/TextField';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { base } from '@/config/api/base';
import { ENDPOINTS } from '@/config/api/endpoints';
import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints/lookup';
import { ROUTES } from '@/config/routes';
import { getEnrollmentContractById } from '@/domains/enrollment-contracts/services';
import {
  contractHasLinkedEnrollment,
  type EnrollmentContract,
} from '@/domains/enrollment-contracts/types';
import { createEnrollment } from '@/domains/enrollment-records/services';
import type { TeamMember } from '@/domains/lookup/types/team-members';
import { http } from '@/lib/api/client';
import { getInitials } from '@/lib/utils/string';
import { cn } from '@/lib/utils/styles';

const STEPS = [
  {
    id: 1 as const,
    title: 'Schedule',
    description:
      "Specify the participant's program start date. Optionally, you may set an end date if known.",
  },
  {
    id: 2 as const,
    title: 'Care Team Members',
    description:
      'Designate at least one qualified staff member to the participant’s care team and assign them an appropriate position.',
  },
  {
    id: 3 as const,
    title: 'Notes',
    description:
      'Add any relevant notes or additional professional context regarding the participant or their program. Notes entered here should be clear and appropriate.',
  },
];

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

export type CreateEnrollmentFromContractModalProps = {
  contractId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CreateEnrollmentFromContractModal({
  contractId,
  open,
  onOpenChange,
}: CreateEnrollmentFromContractModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [startDate, setStartDate] = React.useState<Date | undefined>(() =>
    startOfDay(new Date()),
  );
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  const [notes, setNotes] = React.useState('');
  const [rows, setRows] = React.useState<TeamMemberRow[]>([newRow()]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const {
    data: contract,
    isPending: contractLoading,
    isError: contractError,
    error: contractFetchError,
    refetch,
  } = useQuery({
    queryKey: ['enrollment-contract', contractId],
    enabled: open && contractId != null,
    queryFn: async () => {
      if (contractId == null) throw new Error('Missing contract.');
      const res = await getEnrollmentContractById(contractId);
      if (res.status === 'error') {
        throw new Error(res.message || 'Could not load contract.');
      }
      return res.data;
    },
  });

  React.useEffect(() => {
    if (!open || contractId == null) return;
    setStep(1);
    setStartDate(startOfDay(new Date()));
    setEndDate(undefined);
    setNotes('');
    setRows([newRow()]);
    setErrors({});
  }, [open, contractId]);

  const { data: teamMembers = [], isLoading: teamMembersLoading } = useQuery({
    queryKey: ['lookup', LOOKUP_ENDPOINTS.TEAM_MEMBERS],
    enabled:
      open &&
      contractId != null &&
      Boolean(contract) &&
      contract?.status === 'signed' &&
      !contractHasLinkedEnrollment(contract),
    queryFn: async () => {
      const res = await http.get<TeamMember[]>(LOOKUP_ENDPOINTS.TEAM_MEMBERS);
      return res.status === 'success' ? res.data : [];
    },
  });

  const optionsForRow = React.useCallback(
    (rowIndex: number): ComboboxOption[] => {
      const taken = new Set<number>();
      for (let i = 0; i < rows.length; i++) {
        if (i === rowIndex) continue;
        const uid = rows[i]?.userId;
        if (uid) taken.add(Number.parseInt(uid, 10));
      }
      return teamMembers
        .filter(
          (m) => !taken.has(m.id) || rows[rowIndex]?.userId === String(m.id),
        )
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

  const validateStep1 = (): boolean => {
    const next: Record<string, string> = {};
    if (!startDate) {
      next.starts_at = 'Start date is required.';
    }
    if (
      startDate &&
      endDate &&
      startOfDay(endDate).getTime() < startOfDay(startDate).getTime()
    ) {
      next.ends_at = 'End date must be on or after the start date.';
    }
    setErrors((prev) => {
      const cleared = { ...prev };
      delete cleared.starts_at;
      delete cleared.ends_at;
      return { ...cleared, ...next };
    });
    return Object.keys(next).length === 0;
  };

  const validateStep2 = (): boolean => {
    const next = validateCareTeamRows(rows);
    setErrors((prev) => {
      const cleared = clearCareTeamFieldErrors(prev);
      return { ...cleared, ...next };
    });
    return Object.keys(next).length === 0;
  };

  const validateAllForSubmit = (): boolean => {
    if (!validateStep1()) {
      setStep(1);
      return false;
    }
    if (!validateStep2()) {
      setStep(2);
      return false;
    }
    return true;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (c: EnrollmentContract) => {
      const membersPayload = rows
        .filter((r) => r.userId.trim() && r.position.trim())
        .map((r) => ({
          user_id: Number.parseInt(r.userId, 10),
          position: r.position.trim(),
        }));

      const startsAt = startDate
        ? format(startOfDay(startDate), 'yyyy-MM-dd')
        : '';
      const endsAt =
        endDate != null ? format(startOfDay(endDate), 'yyyy-MM-dd') : null;

      const res = await createEnrollment({
        enrollment_contract_id: c.id,
        starts_at: startsAt,
        ends_at: endsAt && endsAt.length > 0 ? endsAt : null,
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
    onSuccess: (data) => {
      toast.success('The enrollment has been created successfully.');

      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.ENROLLMENT_CONTRACTS.LIST],
      });
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.ENROLLMENT_RECORDS.LIST],
      });
      if (contractId != null) {
        queryClient.invalidateQueries({
          queryKey: ['enrollment-contract', contractId],
        });
      }
      onOpenChange(false);
      if (data?.id != null) {
        router.push(
          ROUTES.ADMIN.MODULES.ENROLLMENT_RECORDS.DETAIL(String(data.id)),
        );
      } else {
        router.push(ROUTES.ADMIN.MODULES.ENROLLMENT_CONTRACTS.LIST);
      }
    },
    onError: (e: Error) => {
      if (e.message === '__FIELD_ERRORS__') return;
      toast.error(e.message ?? 'Could not create enrollment.');
    },
  });

  const handleSubmit = () => {
    if (!contract) return;
    if (!validateAllForSubmit()) return;
    mutate(contract);
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
      delete n[`team_members.${index}.user_id`];
      delete n[`team_members.${index}.position`];
      return n;
    });
  };

  const goNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const goBack = () => {
    if (step > 1) setStep((s) => (s === 2 ? 1 : s === 3 ? 2 : 1));
  };

  const endCalendarDisabled = startDate
    ? { before: startOfDay(startDate) }
    : undefined;

  const eligible =
    contract &&
    contract.status === 'signed' &&
    !contractHasLinkedEnrollment(contract);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={!isPending}
        className={enrollmentWizardDialogContentClass}
      >
        <div className='border-border flex min-h-0 flex-1 flex-col overflow-hidden'>
          <DialogHeader className='border-border shrink-0 border-b px-6 pt-6 pb-4 text-left'>
            <DialogTitle className='text-foreground text-[15.5px] font-bold capitalize'>
              Create Enrollment from Contract
            </DialogTitle>
            <DialogDescription className='text-muted-foreground text-[13px] leading-relaxed font-medium'>
              Link this signed contract to a new program enrollment. You can
              adjust dates, assign the care team, and add internal notes before
              submitting.
            </DialogDescription>
          </DialogHeader>

          <div className='flex min-h-0 flex-1 flex-col overflow-hidden px-6 py-4'>
            {contractLoading ? (
              <p className='text-muted-foreground py-8 text-center text-sm font-medium'>
                Loading contract…
              </p>
            ) : contractError || !contract ? (
              <div className='space-y-4 py-4'>
                <p className='text-destructive text-sm font-medium'>
                  {contractFetchError instanceof Error
                    ? contractFetchError.message
                    : 'Could not load contract.'}
                </p>
                <Button
                  type='button'
                  variant='outline'
                  className={wizardOutlineButtonClass}
                  onClick={() => void refetch()}
                >
                  Retry
                </Button>
              </div>
            ) : !eligible ? (
              <div className='bg-muted/50 border-border rounded-lg border p-4 text-sm'>
                <p className='text-foreground font-medium'>
                  {contract.status !== 'signed'
                    ? 'This contract is not signed yet. Create an enrollment only after the client completes e-signature.'
                    : 'An enrollment already exists for this contract.'}
                </p>
              </div>
            ) : (
              <div className='flex min-h-0 flex-1 flex-col gap-4 overflow-hidden'>
                <ol
                  className='flex w-full shrink-0 gap-2'
                  aria-label='Enrollment setup steps'
                >
                  {STEPS.map((s) => {
                    const active = step === s.id;
                    const completed = step > s.id;
                    const upcoming = step < s.id;
                    return (
                      <li key={s.id} className='min-w-0 flex-1'>
                        <div
                          className={cn(
                            'flex flex-col gap-1 rounded-lg border px-2 py-2 text-center transition-colors',
                            active &&
                              'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm',
                            completed && 'border-border bg-muted/30',
                            upcoming && 'border-border bg-background',
                          )}
                        >
                          <span
                            className={cn(
                              'text-[11px] font-bold tracking-wide uppercase',
                              active ? 'text-primary' : 'text-muted-foreground',
                            )}
                          >
                            Step {s.id}
                          </span>
                          <span
                            className={cn(
                              'truncate text-xs font-semibold',
                              active
                                ? 'text-foreground'
                                : 'text-muted-foreground',
                            )}
                          >
                            {s.title}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ol>

                <p className='text-muted-foreground shrink-0 text-[13px] leading-relaxed font-medium'>
                  {STEPS[step - 1]?.description}
                </p>

                <div
                  className={cn(
                    enrollmentWizardStepBodyCardClass,
                    STEP_BODY_HEIGHT_CLASS,
                  )}
                >
                  <div
                    className={cn(
                      'min-h-0 flex-1 p-3 sm:p-4',
                      step === 2
                        ? 'flex flex-col overflow-hidden'
                        : 'overflow-x-hidden overflow-y-auto',
                    )}
                  >
                    {step === 1 ? (
                      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4'>
                        <DatePickerField
                          label='Start Date'
                          required
                          presets
                          clearable={false}
                          dateFormat='PP'
                          className='[&_button]:text-[13px] md:[&_button]:text-[13px]'
                          value={startDate}
                          onChange={(d) => {
                            setStartDate(d ? startOfDay(d) : undefined);
                            setErrors((p) => {
                              const n = { ...p };
                              delete n.starts_at;
                              return n;
                            });
                            if (
                              d &&
                              endDate &&
                              startOfDay(endDate).getTime() <
                                startOfDay(d).getTime()
                            ) {
                              setEndDate(undefined);
                              setErrors((p) => {
                                const n = { ...p };
                                delete n.ends_at;
                                return n;
                              });
                            }
                          }}
                          error={errors.starts_at}
                        />
                        <DatePickerField
                          label='End Date'
                          presets={false}
                          placeholder='Optional — pick end date'
                          dateFormat='PP'
                          className='[&_button]:text-[13px] md:[&_button]:text-[13px]'
                          value={endDate}
                          onChange={(d) => {
                            setEndDate(d ? startOfDay(d) : undefined);
                            setErrors((p) => {
                              const n = { ...p };
                              delete n.ends_at;
                              return n;
                            });
                          }}
                          error={errors.ends_at}
                          calendarProps={{
                            disabled: endCalendarDisabled,
                          }}
                        />
                      </div>
                    ) : null}

                    {step === 2 ? (
                      <div className='flex min-h-0 flex-1 flex-col gap-2'>
                        <div className='flex shrink-0 flex-wrap items-center justify-between gap-2'>
                          <Label
                            id='care-team-heading'
                            className='text-foreground text-[13px] font-semibold'
                          >
                            Care Team{' '}
                            <span className='text-destructive'>*</span>
                          </Label>
                          <Button
                            type='button'
                            variant='outline'
                            className={cn(
                              wizardOutlineButtonClass,
                              'h-9 px-2.5 text-xs sm:h-10 sm:px-3 sm:text-[13px]',
                            )}
                            onClick={() => setRows((r) => [...r, newRow()])}
                          >
                            <PlusIcon className='size-3.5 shrink-0' />
                            Add member
                          </Button>
                        </div>
                        <div
                          className='border-border bg-background min-h-0 flex-1 overflow-x-hidden overflow-y-auto rounded-md border'
                          role='group'
                          aria-labelledby='care-team-heading'
                        >
                          <div
                            className='text-muted-foreground border-border bg-muted/25 hidden grid-cols-[minmax(0,1fr)_minmax(8rem,11rem)_2.5rem] gap-x-2 border-b px-2 py-1.5 text-[10px] font-bold tracking-wide uppercase sm:grid'
                            aria-hidden
                          >
                            <span>Staff</span>
                            <span>Position</span>
                            <span className='text-center'> </span>
                          </div>
                          <ul className='divide-border max-h-full divide-y'>
                            {rows.map((row, index) => {
                              const staffError =
                                errors[`team_members.${index}.user_id`];
                              const posError =
                                errors[`team_members.${index}.position`];
                              return (
                                <li key={row.key}>
                                  <div className='grid grid-cols-1 gap-2 p-2 sm:grid-cols-[minmax(0,1fr)_minmax(8rem,11rem)_2.5rem] sm:items-center sm:gap-x-2 sm:gap-y-0 sm:p-2'>
                                    <div className='min-w-0'>
                                      <span className='text-muted-foreground mb-1 block text-[10px] font-semibold uppercase sm:sr-only'>
                                        Staff · {index + 1}
                                      </span>
                                      <ComboboxField
                                        placeholder={
                                          teamMembersLoading
                                            ? 'Loading…'
                                            : 'Select member'
                                        }
                                        disabled={teamMembersLoading}
                                        options={optionsForRow(index)}
                                        value={row.userId || null}
                                        onChange={(val) =>
                                          updateRow(index, {
                                            userId: val != null ? val : '',
                                          })
                                        }
                                        emptyMessage='No team members found.'
                                        searchPlaceholder='Name or email'
                                        error={staffError}
                                        className='**:[[role=combobox]]:text-[13px] md:**:[[role=combobox]]:text-[13px]'
                                      />
                                    </div>
                                    <div className='min-w-0'>
                                      <span className='text-muted-foreground mb-1 block text-[10px] font-semibold uppercase sm:sr-only'>
                                        Position
                                      </span>
                                      <TextField
                                        placeholder='e.g. Lead coach'
                                        maxLength={50}
                                        value={row.position}
                                        onChange={(e) =>
                                          updateRow(index, {
                                            position: e.target.value,
                                          })
                                        }
                                        error={posError}
                                        className='text-[13px] md:text-[13px]'
                                        aria-label={`Position for member ${index + 1}`}
                                      />
                                    </div>
                                    <div className='flex justify-end sm:items-center sm:justify-center'>
                                      {rows.length > 1 ? (
                                        <Button
                                          type='button'
                                          variant='ghost'
                                          size='icon'
                                          className='text-muted-foreground hover:bg-muted hover:text-destructive size-8 shrink-0 rounded-md'
                                          aria-label={`Remove member ${index + 1}`}
                                          onClick={() => {
                                            setRows((prev) =>
                                              prev.filter(
                                                (_, i) => i !== index,
                                              ),
                                            );
                                            setErrors((p) =>
                                              clearCareTeamFieldErrors(p),
                                            );
                                          }}
                                        >
                                          <Trash2Icon className='size-4' />
                                        </Button>
                                      ) : (
                                        <span
                                          className='inline-block size-8 shrink-0'
                                          aria-hidden
                                        />
                                      )}
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    ) : null}

                    {step === 3 ? (
                      <TextAreaField
                        label='Internal Notes (Optional)'
                        placeholder='Enter any relevant internal notes for this enrollment (visible to staff only)'
                        value={notes}
                        onChange={(e) => {
                          setNotes(e.target.value);
                          setErrors((p) => {
                            const n = { ...p };
                            delete n.notes;
                            return n;
                          });
                        }}
                        rows={8}
                        className='min-h-30 resize-none text-[13px] md:text-[13px]'
                        error={errors.notes}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {contract && !contractLoading && !contractError && eligible ? (
          <DialogFooter className={enrollmentWizardDialogFooterClass}>
            {step === 1 ? (
              <Button
                type='button'
                variant='outline'
                disabled={isPending}
                className={wizardOutlineButtonClass}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            ) : (
              <Button
                type='button'
                variant='outline'
                disabled={isPending}
                className={wizardOutlineButtonClass}
                onClick={goBack}
              >
                <ArrowLeftIcon className='size-3.5 shrink-0' />
                Previous
              </Button>
            )}
            {step < 3 ? (
              <Button
                type='button'
                variant='default'
                disabled={isPending}
                className={wizardPrimaryButtonClass}
                onClick={goNext}
              >
                Continue
                <ChevronRightIcon className='size-3.5 shrink-0' />
              </Button>
            ) : (
              <Button
                type='button'
                variant='default'
                disabled={isPending}
                className={wizardPrimaryButtonClass}
                onClick={handleSubmit}
              >
                <CheckCircle2Icon className='size-3.5 shrink-0' />
                {isPending ? 'Creating…' : 'Create enrollment'}
              </Button>
            )}
          </DialogFooter>
        ) : !contractLoading && (contractError || !contract) ? (
          <DialogFooter className={enrollmentWizardDialogFooterClass}>
            <Button
              type='button'
              variant='outline'
              className={wizardOutlineButtonClass}
              onClick={() => onOpenChange(false)}
            >
              <XIcon className='size-3.5 shrink-0' />
              Close
            </Button>
          </DialogFooter>
        ) : contract && !eligible ? (
          <DialogFooter className={enrollmentWizardDialogFooterClass}>
            <Button
              type='button'
              variant='outline'
              className={wizardOutlineButtonClass}
              onClick={() => onOpenChange(false)}
            >
              <XIcon className='size-3.5 shrink-0' />
              Close
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
