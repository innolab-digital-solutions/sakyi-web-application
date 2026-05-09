'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  ChevronRightIcon,
  ClipboardListIcon,
  FileTextIcon,
  PenSquareIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

import EnrollmentIntakeConfirmation from '@/components/admin/modules/enrollment-requests/EnrollmentIntakeConfirmation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TableCellEmpty from '@/components/ui/table-cell-empty';
import { base } from '@/config/api/base';
import { ENDPOINTS } from '@/config/api/endpoints';
import { ROUTES } from '@/config/routes';
import {
  getEnrollmentSummariesFromRequest,
  pickPrimaryEnrollment,
} from '@/domains/enrollment-requests/lib/detail-helpers';
import { getEnrollmentRequestById } from '@/domains/enrollment-requests/services';
import type {
  EnrollmentRequestEnrollmentSummary,
  EnrollmentRequestResource,
  EnrollmentRequestStatus,
} from '@/domains/enrollment-requests/types';
import {
  createOnboardingIntake,
  getOnboardingTemplateByVersion,
} from '@/domains/intake-assessments/services';
import { getInitials } from '@/lib/utils/string';
import { cn } from '@/lib/utils/styles';

const PROGRAM_THUMBNAIL_FALLBACK = '/images/logo-gray.png';

/** Matches admin back / secondary actions (`enrollment-requests/[id]/page`). */
const ADMIN_OUTLINE_BUTTON_CLASS =
  'normal-case bg-background hover:bg-muted h-10 shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold';

/** Matches primary list CTAs (`blog-posts/page` “Add blog post”). */
const ADMIN_PRIMARY_BUTTON_CLASS =
  'normal-case h-10 shrink-0 gap-1.5 rounded-md px-3 text-[13px]! font-semibold';

/** Primary white card shell (list/detail screens + overview). */
const CARD_SURFACE =
  'border-border max-w-full min-w-0 rounded-md border bg-white p-6 shadow-xs';

function EnrollmentRequestOverviewSkeleton() {
  return (
    <div className='grid gap-3 lg:grid-cols-3 lg:gap-4'>
      <section className={`${CARD_SURFACE} space-y-5 lg:col-span-2`}>
        <header className='border-border border-b pb-5'>
          <Skeleton className='h-5 w-44 rounded-sm' />
          <Skeleton className='mt-2 h-3 w-80 rounded-sm' />
        </header>
        <div className='space-y-7 pt-5'>
          {Array.from({ length: 4 }).map((_, stepIdx) => (
            <div key={`pipeline-skeleton-${stepIdx}`} className='flex gap-5'>
              <div className='pt-0.5'>
                <Skeleton className='size-9 rounded-full' />
              </div>
              <div className='min-w-0 flex-1 space-y-3'>
                <div>
                  <Skeleton className='h-5 w-52 rounded-sm' />
                  <Skeleton className='mt-2 h-3 w-72 rounded-sm' />
                </div>
                <div className='border-border bg-muted/20 space-y-3 rounded-md border p-3.5 sm:p-4'>
                  <div className='grid gap-1.5 md:grid-cols-3'>
                    {Array.from({ length: 3 }).map((__, metricIdx) => (
                      <div
                        key={`pipeline-skeleton-${stepIdx}-metric-${metricIdx}`}
                        className='bg-muted/50 border-border min-h-18 space-y-2 rounded-md border px-2.5 py-2'
                      >
                        <Skeleton className='h-3 w-24 rounded-sm' />
                        <Skeleton className='h-4 w-32 rounded-sm' />
                      </div>
                    ))}
                  </div>
                  <Skeleton className='h-10 w-full rounded-md' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <div className='flex min-h-0 min-w-0 flex-col gap-3 lg:gap-4'>
        {Array.from({ length: 2 }).map((_, idx) => (
          <section
            key={`side-skeleton-${idx}`}
            className={`${CARD_SURFACE} flex min-h-0 flex-col`}
          >
            <header className='border-border border-b pb-4'>
              <Skeleton className='h-5 w-40 rounded-sm' />
              <Skeleton className='mt-2 h-3 w-64 rounded-sm' />
            </header>
            <div className='space-y-3 pt-5'>
              <Skeleton className='h-12 w-full rounded-md' />
              <Skeleton className='h-12 w-full rounded-md' />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

/** Field caption — matches `IntakeDetailPanel` DetailItem labels. */
const DETAIL_LABEL =
  'text-muted-foreground text-[10px]! font-semibold tracking-wide uppercase';

const STATUS_LABEL: Record<EnrollmentRequestStatus, string> = {
  pending: 'Pending',
  contacted: 'Contacted',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

function resolveClientPictureUrl(
  raw: string | null | undefined,
): string | undefined {
  if (!raw?.trim()) return undefined;
  const t = raw.trim();
  if (t.startsWith('http')) return t;
  return `${base.domainEndpoint}${t}`;
}

function resolveProgramThumbnailUrl(raw: string | null | undefined): string {
  if (!raw?.trim()) return PROGRAM_THUMBNAIL_FALLBACK;
  const t = raw.trim();
  if (t.startsWith('http')) return t;
  return `${base.domainEndpoint}${t}`;
}

function ProgramThumbnail({
  thumbnailUrl,
}: {
  thumbnailUrl: string | null | undefined;
}) {
  const [useFallback, setUseFallback] = useState(() => !thumbnailUrl?.trim());
  const src = useFallback
    ? PROGRAM_THUMBNAIL_FALLBACK
    : resolveProgramThumbnailUrl(thumbnailUrl);
  const unoptimized = src.startsWith('http://') || src.startsWith('https://');

  return (
    <div className='bg-muted border-border relative size-12 shrink-0 overflow-hidden rounded-md border'>
      <Image
        src={src}
        alt=''
        width={48}
        height={48}
        unoptimized={unoptimized}
        className='size-full object-cover'
        onError={() => setUseFallback(true)}
        aria-hidden
      />
    </div>
  );
}

function formatDateCell(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  try {
    return format(parseISO(iso.trim()), 'dd-MMMM-yyyy');
  } catch {
    return iso.trim();
  }
}

function formatDateOnly(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const raw = value.trim();
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return format(parseISO(raw), 'dd-MMMM-yyyy');
    }
    return format(parseISO(raw), 'dd-MMMM-yyyy');
  } catch {
    return raw;
  }
}

function formatPipelineLabel(value: string | null | undefined): string {
  if (!value?.trim()) return '—';
  return value
    .trim()
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function getProgramLabel(request: EnrollmentRequestResource): string {
  if (request.program?.title?.trim()) return request.program.title.trim();
  if (request.program?.slug?.trim()) return request.program.slug.trim();
  return '—';
}

function getProgramCode(request: EnrollmentRequestResource): string {
  const code = request.program?.code?.trim();
  if (code) return code;
  if (request.program?.id != null) return `ID ${request.program.id}`;
  return '—';
}

/**
 * Shared muted tile shell + label typography with
 * {@link OperationalLogWorkspaceContextBar}.
 */
const WORKSPACE_CONTEXT_TILE_CLASS =
  'bg-muted/50 border-border flex min-h-18 flex-col justify-center rounded-md border px-2.5 py-2';

const WORKSPACE_CONTEXT_LABEL_CLASS =
  'text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wide uppercase';

/** Minimal placeholder when an overview KPI has no value (no badge styling). */
const OVERVIEW_EMPTY_DASH = (
  <span className='text-muted-foreground font-semibold'>-</span>
);

/** Single metric cell for the enrollment overview KPI grid (same card design as workspace context tiles). */
function EnrollmentOverviewMetricTile({
  label,
  value,
  tabularNums = true,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  tabularNums?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className={WORKSPACE_CONTEXT_TILE_CLASS}>
      <p className={WORKSPACE_CONTEXT_LABEL_CLASS}>{label}</p>
      <div
        className={cn(
          'text-foreground/90 text-[12.5px] leading-snug font-semibold',
          tabularNums && 'tabular-nums',
          valueClassName,
        )}
      >
        {value}
      </div>
    </div>
  );
}

function PipelineStateNote({
  title,
  metaValue,
  tone = 'warning',
  children,
}: {
  title: string;
  metaValue: ReactNode;
  tone?: 'warning' | 'danger';
  children: ReactNode;
}) {
  const toneClass =
    tone === 'danger'
      ? 'border-border bg-muted/35 text-muted-foreground'
      : 'border-border bg-muted/25 text-muted-foreground';

  return (
    <div
      role='status'
      className={cn(
        'space-y-2.5 rounded-md border p-3 text-[13px] font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]',
        toneClass,
      )}
    >
      <div className='px-1'>
        <p className={DETAIL_LABEL}>{title}</p>
        <div className='text-foreground/90 mt-1 text-[12.5px] leading-snug font-semibold tabular-nums'>
          {metaValue}
        </div>
      </div>
      <div className='text-foreground/90 space-y-1 px-1 pt-0.5 text-[12.5px] leading-relaxed'>
        {children}
      </div>
    </div>
  );
}

function PipelineEmptyState({
  description,
}: {
  description: string;
}) {
  return (
    <div className='px-1 py-0.5'>
      <p className='text-muted-foreground text-[12.5px] leading-relaxed font-medium'>
        {description}
      </p>
    </div>
  );
}

function PipelineStepShell({
  index,
  title,
  subtitle,
  isLast,
  contentClassName,
  children,
}: {
  index: number;
  title: string;
  subtitle?: string | null;
  isLast?: boolean;
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={
        isLast ? 'relative flex gap-5' : 'relative flex gap-5 pb-10 md:pb-12'
      }
    >
      {!isLast ? (
        <div
          aria-hidden
          className='bg-border absolute top-11 bottom-0 left-4.25 w-px'
        />
      ) : null}
      <div className='relative z-1 flex shrink-0 flex-col items-center'>
        <span className='border-border bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-full border text-xs font-semibold shadow-xs'>
          {index}
        </span>
      </div>
      <div className='min-w-0 flex-1 space-y-3'>
        <div>
          <h3 className='text-foreground text-sm font-semibold'>{title}</h3>
          {subtitle?.trim() ? (
            <p className='text-muted-foreground mt-1 text-xs leading-snug font-medium'>
              {subtitle}
            </p>
          ) : null}
        </div>
        <div
          className={cn(
            'border-border bg-muted/20 rounded-md border p-3.5 sm:p-4',
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export type EnrollmentRequestDetailViewProps = {
  requestId: number;
};

export default function EnrollmentRequestDetailView({
  requestId,
}: EnrollmentRequestDetailViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showStartIntakeConfirmation, setShowStartIntakeConfirmation] =
    useState(false);
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['enrollment-request', requestId],
    queryFn: async () => {
      const res = await getEnrollmentRequestById(requestId);
      if (res.status === 'error') {
        throw new Error(res.message || 'Could not load enrollment request.');
      }
      return res.data;
    },
  });
  const { mutate: startIntake, isPending: isStartingIntake } = useMutation({
    mutationFn: async () => {
      const templateResponse = await getOnboardingTemplateByVersion(1);
      if (templateResponse.status === 'error') {
        throw new Error(templateResponse.message || 'Could not load template.');
      }

      const createResponse = await createOnboardingIntake({
        enrollment_request_id: requestId,
        onboarding_template_id: templateResponse.data.id,
      });

      if (createResponse.status === 'error') {
        throw new Error(createResponse.message || 'Could not create intake.');
      }

      return createResponse.data.id;
    },
    onSuccess: async (intakeId) => {
      setShowStartIntakeConfirmation(false);
      toast.success('The intake assessment has been created successfully.');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['enrollment-request', requestId],
        }),
        queryClient.invalidateQueries({
          queryKey: ['table', ENDPOINTS.ADMIN.MODULES.ENROLLMENT_REQUESTS.LIST],
        }),
        queryClient.invalidateQueries({
          queryKey: ['table', ENDPOINTS.ADMIN.MODULES.INTAKE_ASSESSMENTS.LIST],
        }),
      ]);
      router.push(
        ROUTES.ADMIN.MODULES.INTAKE_ASSESSMENTS.INTERVIEW(String(intakeId)),
      );
    },
    onError: (mutationError) => {
      toast.error(mutationError.message ?? 'Could not create intake assessment.');
    },
  });

  if (isPending) {
    return <EnrollmentRequestOverviewSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className='border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-6 text-sm'>
        {error instanceof Error ? error.message : 'Could not load request.'}
      </div>
    );
  }

  const enrollmentsList = getEnrollmentSummariesFromRequest(data);
  const primaryEnrollment = pickPrimaryEnrollment(enrollmentsList);

  const requestCompletedAt = formatDateCell(data.completed_at);
  const contactedAt = formatDateCell(data.contacted_at);
  const clientPic = resolveClientPictureUrl(data.client?.picture_url);
  const programLabel = getProgramLabel(data);
  const programCode = getProgramCode(data);

  const secondaryEnrollments = primaryEnrollment
    ? enrollmentsList.filter((e) => e.id !== primaryEnrollment.id)
    : [];
  const canStartIntake =
    Boolean(data.client?.id) &&
    !data.onboarding_intake &&
    (data.status === 'pending' || data.status === 'contacted');

  return (
    <div className='grid gap-3 lg:grid-cols-3 lg:gap-4'>
      <section className={`${CARD_SURFACE} space-y-5 lg:col-span-2`}>
        <header className='border-border border-b pb-5'>
          <h3 className='text-foreground text-sm font-semibold'>
            Enrollment Pipeline
          </h3>
          <p className='text-muted-foreground mt-1 max-w-3xl text-[13px] leading-relaxed font-medium'>
            End-to-end enrollment workflow for this applicant. Use each step to
            review intake, contract, and enrollment progress.
          </p>
        </header>

        <div className='min-w-0 pt-5'>
          <PipelineStepShell
            index={1}
            title='Enrollment Request'
            subtitle='Traceable enrollment request checkpoints for operations, outreach, and audit follow-up'
          >
            <div className='space-y-3'>
              <div className='grid gap-1.5 md:grid-cols-3'>
                <EnrollmentOverviewMetricTile
                  label='Request reference'
                  value={data.code?.trim() ? data.code.trim() : `#${data.id}`}
                />
                <EnrollmentOverviewMetricTile
                  label='Workflow status'
                  value={STATUS_LABEL[data.status]}
                  tabularNums={false}
                />
                <EnrollmentOverviewMetricTile
                  label='Request submitted'
                  value={
                    formatDateCell(data.timestamps?.created_at) ??
                    OVERVIEW_EMPTY_DASH
                  }
                />
                <EnrollmentOverviewMetricTile
                  label='First contacted'
                  value={contactedAt ?? OVERVIEW_EMPTY_DASH}
                />
                <EnrollmentOverviewMetricTile
                  label='Completed at'
                  value={requestCompletedAt ?? OVERVIEW_EMPTY_DASH}
                />
                <EnrollmentOverviewMetricTile
                  label='Phone on request'
                  value={
                    data.phone?.trim() ? data.phone.trim() : OVERVIEW_EMPTY_DASH
                  }
                />
              </div>
              {data.status === 'cancelled' || data.cancelled_at?.trim() ? (
                <PipelineStateNote
                  title='Request cancellation'
                  metaValue={formatDateCell(data.cancelled_at) ?? '—'}
                  tone='danger'
                >
                  <p className='whitespace-pre-wrap'>
                    {data.cancellation_note?.trim() ||
                      'No cancellation note was recorded for this request.'}
                  </p>
                </PipelineStateNote>
              ) : null}
              {canStartIntake ? (
                <div className='border-border flex justify-end border-t pt-4'>
                  <Button
                    className={ADMIN_PRIMARY_BUTTON_CLASS}
                    onClick={() => setShowStartIntakeConfirmation(true)}
                  >
                    <ClipboardListIcon className='size-3.5' />
                    Start Intake Interview
                  </Button>
                </div>
              ) : null}
            </div>
          </PipelineStepShell>

          <PipelineStepShell
            index={2}
            title='Intake Assessment'
            contentClassName={
              data.onboarding_intake ? undefined : 'border-dashed bg-muted/10'
            }
            subtitle={
              data.onboarding_intake
                ? 'Traceable intake checkpoints for readiness and workflow progression'
                : 'No intake assessment has started for this applicant yet'
            }
          >
            {data.onboarding_intake?.id != null ? (
              <div className='space-y-3'>
                <div className='grid gap-1.5 md:grid-cols-3'>
                  <EnrollmentOverviewMetricTile
                    label='Intake reference'
                    value={
                      data.onboarding_intake.code?.trim()
                        ? data.onboarding_intake.code.trim()
                        : `#${data.onboarding_intake.id}`
                    }
                  />
                  <EnrollmentOverviewMetricTile
                    label='Intake status'
                    value={formatPipelineLabel(data.onboarding_intake.status)}
                    tabularNums={false}
                  />
                  <EnrollmentOverviewMetricTile
                    label='Intake completed'
                    value={
                      formatDateCell(data.onboarding_intake.completed_at) ??
                      OVERVIEW_EMPTY_DASH
                    }
                  />
                </div>
                {data.onboarding_intake.status === 'cancelled' ||
                data.onboarding_intake.cancelled_at?.trim() ? (
                  <PipelineStateNote
                    title='Intake cancellation'
                    metaValue={
                      formatDateCell(data.onboarding_intake.cancelled_at) ?? '—'
                    }
                    tone='danger'
                  >
                    <p>
                      No cancellation note was provided on this intake record.
                    </p>
                  </PipelineStateNote>
                ) : null}
                <div className='border-border flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-end'>
                  {data.onboarding_intake.status === 'draft' ||
                  data.onboarding_intake.status === 'in_progress' ? (
                    <Button className={ADMIN_PRIMARY_BUTTON_CLASS} asChild>
                      <Link
                        href={ROUTES.ADMIN.MODULES.INTAKE_ASSESSMENTS.INTERVIEW(
                          String(data.onboarding_intake.id),
                        )}
                      >
                        <PenSquareIcon className='size-3.5' />
                        Continue Interview
                        <ChevronRightIcon className='size-3.5 opacity-70' />
                      </Link>
                    </Button>
                  ) : null}
                  <Button
                    variant='outline'
                    className={ADMIN_OUTLINE_BUTTON_CLASS}
                    asChild
                  >
                    <Link
                      href={ROUTES.ADMIN.MODULES.INTAKE_ASSESSMENTS.DETAIL(
                        String(data.onboarding_intake.id),
                      )}
                    >
                      <FileTextIcon className='size-3.5' />
                      Open Intake
                      <ChevronRightIcon className='size-3.5 opacity-70' />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <PipelineEmptyState
                description='Start or assign an intake from Enrollment Requests when this applicant becomes eligible.'
              />
            )}
          </PipelineStepShell>

          <PipelineStepShell
            index={3}
            title='Contract & E-signature'
            contentClassName={data.contract ? undefined : 'border-dashed bg-muted/10'}
            subtitle={
              data.contract
                ? 'Traceable contract and e-signature checkpoints for approval and legal audit'
                : 'No contract has been created for this pipeline yet'
            }
          >
            {data.contract?.id != null ? (
              <div className='space-y-3'>
                <div className='grid gap-1.5 md:grid-cols-2'>
                  <EnrollmentOverviewMetricTile
                    label='Contract reference'
                    value={
                      data.contract.code?.trim()
                        ? data.contract.code.trim()
                        : `#${data.contract.id}`
                    }
                  />
                  <EnrollmentOverviewMetricTile
                    label='Contract status'
                    value={formatPipelineLabel(data.contract.status)}
                    tabularNums={false}
                  />
                  <EnrollmentOverviewMetricTile
                    label='Sent at'
                    value={
                      formatDateCell(data.contract.sent_at) ??
                      OVERVIEW_EMPTY_DASH
                    }
                  />
                  <EnrollmentOverviewMetricTile
                    label='Signed at'
                    value={
                      formatDateCell(data.contract.signed_at) ??
                      OVERVIEW_EMPTY_DASH
                    }
                  />
                </div>
                {data.contract.voided_at?.trim() ||
                data.contract.void_reason?.trim() ? (
                  <PipelineStateNote
                    title='Contract voided'
                    metaValue={formatDateCell(data.contract.voided_at) ?? '—'}
                  >
                    {data.contract.void_reason?.trim() ? (
                      <p className='whitespace-pre-wrap'>
                        {data.contract.void_reason.trim()}
                      </p>
                    ) : (
                      <p>No void reason was provided on this contract.</p>
                    )}
                  </PipelineStateNote>
                ) : null}
                <div className='border-border flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-end'>
                  <Button
                    variant='outline'
                    className={ADMIN_OUTLINE_BUTTON_CLASS}
                    asChild
                  >
                    <Link
                      href={ROUTES.ADMIN.MODULES.ENROLLMENT_CONTRACTS.DETAIL(
                        String(data.contract.id),
                      )}
                    >
                      <FileTextIcon className='size-3.5' />
                      Open Contract
                      <ChevronRightIcon className='size-3.5 opacity-70' />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <PipelineEmptyState
                description='Generate and send the contract after intake is ready to move this applicant forward.'
              />
            )}
          </PipelineStepShell>

          <PipelineStepShell
            index={4}
            title='Enrollment Record'
            contentClassName={primaryEnrollment ? undefined : 'border-dashed bg-muted/10'}
            subtitle={
              enrollmentsList.length > 0
                ? 'Traceable enrollment checkpoints for activation, schedule, and completion monitoring'
                : 'No enrollment record has been created from this pathway yet'
            }
            isLast
          >
            {primaryEnrollment ? (
              <div className='space-y-4'>
                <div className='grid gap-1.5 md:grid-cols-2'>
                  <EnrollmentOverviewMetricTile
                    label='Enrollment reference'
                    value={
                      <span className='tabular-nums'>
                        {primaryEnrollment.code}
                      </span>
                    }
                  />
                  <EnrollmentOverviewMetricTile
                    label='Enrollment status'
                    value={formatPipelineLabel(primaryEnrollment.status)}
                    tabularNums={false}
                  />
                  <EnrollmentOverviewMetricTile
                    label='Plan window'
                    value={
                      <span className='tabular-nums'>
                        {formatDateOnly(primaryEnrollment.starts_at) ?? '—'}{' '}
                        <span className='text-muted-foreground font-medium'>
                          →
                        </span>{' '}
                        {formatDateOnly(primaryEnrollment.ends_at) ?? '—'}
                      </span>
                    }
                    tabularNums={false}
                  />
                  <EnrollmentOverviewMetricTile
                    label='Completed at'
                    value={
                      formatDateCell(primaryEnrollment.completed_at) ??
                      OVERVIEW_EMPTY_DASH
                    }
                  />
                </div>
                {primaryEnrollment.cancelled_at?.trim() ? (
                  <PipelineStateNote
                    title='Enrollment cancellation'
                    metaValue={
                      formatDateCell(primaryEnrollment.cancelled_at) ?? '—'
                    }
                    tone='danger'
                  >
                    <p>
                      No cancellation note is available on enrollment summary
                      rows.
                    </p>
                  </PipelineStateNote>
                ) : null}
                <div className='border-border flex justify-end border-t pt-4'>
                  <Button className={ADMIN_PRIMARY_BUTTON_CLASS} asChild>
                    <Link
                      href={ROUTES.ADMIN.MODULES.ENROLLMENT_RECORDS.DETAIL(
                        String(primaryEnrollment.id),
                      )}
                    >
                      <FileTextIcon className='size-3.5' />
                      Open Enrollment
                      <ChevronRightIcon className='size-3.5' />
                    </Link>
                  </Button>
                </div>
                {secondaryEnrollments.length > 0 ? (
                  <div className='space-y-2'>
                    <p className={DETAIL_LABEL}>Additional enrollments</p>
                    <ul className='border-border divide-border divide-y overflow-hidden rounded-md border'>
                      {secondaryEnrollments.map(
                        (row: EnrollmentRequestEnrollmentSummary) => (
                          <li
                            key={row.id}
                            className='hover:bg-muted/40 flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between'
                          >
                            <div>
                              <p className='text-foreground/90 text-[13px] font-semibold'>
                                {row.code}
                              </p>
                              <p className='text-muted-foreground text-xs leading-snug font-medium'>
                                {formatPipelineLabel(row.status)}
                              </p>
                            </div>
                            <Button
                              variant='outline'
                              className={`${ADMIN_OUTLINE_BUTTON_CLASS} w-full sm:w-auto`}
                              asChild
                            >
                              <Link
                                href={ROUTES.ADMIN.MODULES.ENROLLMENT_RECORDS.DETAIL(
                                  String(row.id),
                                )}
                              >
                                View
                              </Link>
                            </Button>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <PipelineEmptyState
                description={
                  data.onboarding_intake
                    ? 'Intake exists, but no enrollment row has been created yet. Create enrollment when onboarding is approved.'
                    : 'Enrollment appears after intake and contract milestones are completed.'
                }
              />
            )}
          </PipelineStepShell>
        </div>
      </section>

      <div className='flex min-h-0 min-w-0 flex-col gap-3 lg:gap-4'>
        <section className={`${CARD_SURFACE} flex min-h-0 flex-col`}>
          <header className='border-border shrink-0 border-b pb-4'>
            <h3 className='text-foreground text-sm font-semibold'>
              Applicant Account
            </h3>
            <p className='text-muted-foreground mt-1 max-w-3xl text-[13px] leading-relaxed font-medium'>
              Person linked to this enrollment request. Confirm identity here
              before reviewing pipeline progress.
            </p>
          </header>
          {data.client ? (
            <div className='flex min-h-0 flex-1 flex-col gap-4 pt-5'>
              <div className='flex min-w-0 items-start gap-3'>
                <Avatar size='lg' className='mt-0.5 shrink-0'>
                  {clientPic ? <AvatarImage src={clientPic} alt='' /> : null}
                  <AvatarFallback className='text-xs'>
                    {getInitials(data.client.name ?? '', 2) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className='min-w-0 flex-1 space-y-1'>
                  <p className='text-foreground/90 text-[13px] font-semibold'>
                    {data.client.name?.trim() || (
                      <TableCellEmpty label='No name on file' />
                    )}
                  </p>
                  <p className='text-muted-foreground text-xs leading-snug font-medium wrap-break-word'>
                    {data.client.email?.trim() || 'No email on file'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className='text-muted-foreground pt-5 text-sm'>
              No applicant account linked to this request.
            </p>
          )}
        </section>

        <section className={`${CARD_SURFACE} flex min-h-0 flex-col`}>
          <header className='border-border shrink-0 border-b pb-4'>
            <h3 className='text-foreground text-sm font-semibold'>
              Requested Program
            </h3>
            <p className='text-muted-foreground mt-1 max-w-3xl text-[13px] leading-relaxed font-medium'>
              Program selected at the time of application. Use this as the
              reference for intake, contract, and enrollment.
            </p>
          </header>
          {data.program ? (
            <div className='flex min-h-0 flex-1 flex-col gap-4 pt-5'>
              <div className='flex items-start gap-3'>
                <ProgramThumbnail thumbnailUrl={data.program.thumbnail_url} />
                <div className='min-w-0 flex-1 space-y-1'>
                  <p className='text-foreground/90 text-[13px] font-semibold'>
                    {programLabel !== '—' ? (
                      programLabel
                    ) : (
                      <TableCellEmpty label='No title' />
                    )}
                  </p>
                  <p className='text-muted-foreground text-xs leading-snug font-medium'>
                    {programCode !== '—' ? programCode : 'No program code'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className='text-muted-foreground pt-5 text-sm'>
              No program linked to this request.
            </p>
          )}
        </section>
      </div>
      <EnrollmentIntakeConfirmation
        open={showStartIntakeConfirmation}
        isSubmitting={isStartingIntake}
        requestReference={data.code?.trim() || `#${data.id}`}
        onOpenChange={setShowStartIntakeConfirmation}
        onConfirm={() => startIntake()}
      />
    </div>
  );
}
