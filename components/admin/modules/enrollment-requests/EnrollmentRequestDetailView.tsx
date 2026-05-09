'use client';

import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  CheckCircle2Icon,
  ChevronRightIcon,
  ClipboardSignatureIcon,
  FileTextIcon,
  PhoneCallIcon,
  TimerResetIcon,
  UserRoundIcon,
  XCircleIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { type ComponentType, type ReactNode } from 'react';
import { useState } from 'react';

import { AdminDetailCardSkeleton } from '@/components/admin/layout/AdminLoadingSkeletons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import TableCellEmpty from '@/components/ui/table-cell-empty';
import { base } from '@/config/api/base';
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
import { getInitials } from '@/lib/utils/string';

const PROGRAM_THUMBNAIL_FALLBACK = '/images/logo-gray.png';

const STATUS_LABEL: Record<EnrollmentRequestStatus, string> = {
  pending: 'Pending',
  contacted: 'Contacted',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

const STATUS_STYLES: Record<
  EnrollmentRequestStatus,
  {
    icon: ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  pending: {
    icon: TimerResetIcon,
    className:
      'border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  },
  contacted: {
    icon: PhoneCallIcon,
    className:
      'border-sky-300/80 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200',
  },
  completed: {
    icon: CheckCircle2Icon,
    className:
      'border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  },
  cancelled: {
    icon: XCircleIcon,
    className:
      'border-rose-300/80 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
  },
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

function formatRoleLabel(role: string): string {
  return role
    .trim()
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
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

function getRequestReference(request: EnrollmentRequestResource): string {
  const code = request.code?.trim();
  if (code) return code;
  return `#${request.id}`;
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

function PipelineStepShell({
  index,
  title,
  subtitle,
  isLast,
  children,
}: {
  index: number;
  title: string;
  subtitle?: string | null;
  isLast?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={isLast ? 'relative flex gap-4' : 'relative flex gap-4 pb-8'}>
      {!isLast ? (
        <div
          aria-hidden
          className='bg-border absolute top-10 bottom-0 left-[15px] w-px md:left-[17px]'
        />
      ) : null}
      <div className='relative z-[1] flex shrink-0 flex-col items-center'>
        <span className='border-border bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full border text-xs font-bold shadow-xs'>
          {index}
        </span>
      </div>
      <div className='min-w-0 flex-1'>
        <div className='mb-2'>
          <h3 className='text-foreground text-sm font-semibold'>{title}</h3>
          {subtitle?.trim() ? (
            <p className='text-muted-foreground mt-0.5 text-[13px] font-medium'>
              {subtitle}
            </p>
          ) : null}
        </div>
        <div>{children}</div>
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

  if (isPending) {
    return <AdminDetailCardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className='border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-6 text-sm'>
        {error instanceof Error ? error.message : 'Could not load request.'}
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[data.status];
  const StatusIcon = statusStyle.icon;
  const enrollmentsList = getEnrollmentSummariesFromRequest(data);
  const primaryEnrollment = pickPrimaryEnrollment(enrollmentsList);

  const receivedAt = formatDateCell(data.timestamps?.created_at);
  const requestCompletedAt = formatDateCell(data.completed_at);
  const requestCancelledAt = formatDateCell(data.cancelled_at);
  const updatedAt = formatDateCell(data.timestamps?.updated_at);
  const contactedAt = formatDateCell(data.contacted_at);
  const clientPic = resolveClientPictureUrl(data.client?.picture_url);
  const handlerPic = data.handler
    ? resolveClientPictureUrl(data.handler.picture_url)
    : undefined;
  const programLabel = getProgramLabel(data);
  const programCode = getProgramCode(data);

  const showCancellationBanner =
    data.status === 'cancelled' ||
    Boolean(data.cancelled_at?.trim());

  const secondaryEnrollments = primaryEnrollment
    ? enrollmentsList.filter((e) => e.id !== primaryEnrollment.id)
    : [];

  return (
    <div className='space-y-6'>
      <section className='border-border max-w-full min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='min-w-0 space-y-1'>
            <p className='text-muted-foreground text-[11px] font-bold tracking-wide uppercase'>
              Enrollment request
            </p>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3'>
              <h2 className='text-foreground text-lg font-bold tracking-tight'>
                {getRequestReference(data)}
              </h2>
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${statusStyle.className}`}
              >
                <StatusIcon className='size-3.5 shrink-0' />
                {STATUS_LABEL[data.status]}
              </span>
            </div>
            <p className='text-muted-foreground mt-2 max-w-2xl text-[13px] leading-relaxed font-medium'>
              Request status and capture fields. Dates follow the lifecycle of
              this submission.
            </p>
          </div>
        </div>

        {showCancellationBanner ? (
          <div
            role='alert'
            className='border-rose-200 bg-rose-50 text-rose-900 mt-6 rounded-md border px-4 py-3 text-[13px] leading-relaxed font-medium dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-50'
          >
            <span className='block text-xs font-bold tracking-wide uppercase'>
              Cancellation
            </span>
            {data.cancellation_note?.trim() ? (
              <span className='mt-1 block whitespace-pre-wrap'>
                {data.cancellation_note.trim()}
              </span>
            ) : (
              <span className='text-rose-800/90 dark:text-rose-100/90 mt-1 block'>
                No cancellation note was recorded for this request.
              </span>
            )}
          </div>
        ) : null}

        <dl className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <dt className='text-muted-foreground text-xs font-semibold'>
              Phone on request
            </dt>
            <dd className='text-foreground mt-0.5 text-[13px] font-medium tabular-nums'>
              {data.phone?.trim() ? (
                data.phone.trim()
              ) : (
                <TableCellEmpty label='Not provided' />
              )}
            </dd>
          </div>
          <div>
            <dt className='text-muted-foreground text-xs font-semibold'>
              Received
            </dt>
            <dd className='text-foreground mt-0.5 text-[13px] font-medium tabular-nums'>
              {receivedAt ?? <TableCellEmpty label='—' />}
            </dd>
          </div>
          <div>
            <dt className='text-muted-foreground text-xs font-semibold'>
              First contacted
            </dt>
            <dd className='text-foreground mt-0.5 text-[13px] font-medium tabular-nums'>
              {contactedAt ?? <TableCellEmpty label='Not yet' />}
            </dd>
          </div>
          <div>
            <dt className='text-muted-foreground text-xs font-semibold'>
              Request completed
            </dt>
            <dd className='text-foreground mt-0.5 text-[13px] font-medium tabular-nums'>
              {requestCompletedAt ?? <TableCellEmpty label='—' />}
            </dd>
          </div>
          <div>
            <dt className='text-muted-foreground text-xs font-semibold'>
              Request cancelled
            </dt>
            <dd className='text-foreground mt-0.5 text-[13px] font-medium tabular-nums'>
              {requestCancelledAt ?? <TableCellEmpty label='—' />}
            </dd>
          </div>
          <div>
            <dt className='text-muted-foreground text-xs font-semibold'>
              Last updated
            </dt>
            <dd className='text-foreground mt-0.5 text-[13px] font-medium tabular-nums'>
              {updatedAt ?? <TableCellEmpty label='—' />}
            </dd>
          </div>
        </dl>

        {data.notes?.trim() ? (
          <div className='border-border mt-6 border-t pt-6'>
            <dt className='text-muted-foreground text-xs font-semibold'>
              Notes
            </dt>
            <dd className='text-foreground mt-1 text-[13px] font-medium whitespace-pre-wrap'>
              {data.notes.trim()}
            </dd>
          </div>
        ) : null}
      </section>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <section className='border-border max-w-full min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-6'>
          <h2 className='text-foreground text-sm font-semibold'>Client</h2>
          <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
            Applicant linked to this request — compare phones when reaching
            out.
          </p>
          {data.client ? (
            <div className='mt-5 flex items-start gap-4'>
              <Avatar size='lg' className='size-14 shrink-0'>
                {clientPic ? <AvatarImage src={clientPic} alt='' /> : null}
                <AvatarFallback className='text-sm'>
                  {getInitials(data.client.name ?? '', 2) || '?'}
                </AvatarFallback>
              </Avatar>
              <dl className='min-w-0 flex-1 space-y-3'>
                <div>
                  <dt className='text-muted-foreground text-xs font-semibold'>
                    Client code
                  </dt>
                  <dd className='text-foreground text-[13px] font-semibold tabular-nums'>
                    {data.client.client_code?.trim() || (
                      <TableCellEmpty label='Not assigned' />
                    )}
                  </dd>
                </div>
                <div>
                  <dt className='text-muted-foreground text-xs font-semibold'>
                    Name
                  </dt>
                  <dd className='text-foreground text-[13px] font-semibold'>
                    {data.client.name?.trim() || (
                      <TableCellEmpty label='—' />
                    )}
                  </dd>
                </div>
                <div>
                  <dt className='text-muted-foreground text-xs font-semibold'>
                    Email
                  </dt>
                  <dd className='text-foreground text-[13px] font-medium wrap-break-word'>
                    {data.client.email?.trim() || (
                      <TableCellEmpty label='—' />
                    )}
                  </dd>
                </div>
                <div>
                  <dt className='text-muted-foreground text-xs font-semibold'>
                    Profile contact phone
                  </dt>
                  <dd className='text-foreground text-[13px] font-medium tabular-nums'>
                    {data.client.contact_phone?.trim() ? (
                      data.client.contact_phone.trim()
                    ) : (
                      <TableCellEmpty label='Not on profile' />
                    )}
                  </dd>
                </div>
                <div>
                  <dt className='text-muted-foreground text-xs font-semibold'>
                    Phone on request
                  </dt>
                  <dd className='text-muted-foreground/90 text-[13px] font-medium tabular-nums'>
                    {data.phone?.trim() ? (
                      data.phone.trim()
                    ) : (
                      <TableCellEmpty label='Same as intake form' />
                    )}
                  </dd>
                </div>
                <div className='flex flex-wrap gap-2 pt-1'>
                  {data.client.id != null ? (
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-9 gap-1.5'
                      asChild
                    >
                      <Link
                        href={ROUTES.ADMIN.MODULES.CLIENT_PROFILES.DETAIL(
                          String(data.client.id),
                        )}
                      >
                        <UserRoundIcon className='size-3.5' />
                        Open client profile
                        <ChevronRightIcon className='size-3.5 opacity-70' />
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </dl>
            </div>
          ) : (
            <p className='text-muted-foreground mt-4 text-sm'>
              No client linked to this request.
            </p>
          )}
        </section>

        <section className='border-border max-w-full min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-6'>
          <h2 className='text-foreground text-sm font-semibold'>Program</h2>
          <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
            Program chosen when this enrollment request was submitted.
          </p>
          {data.program ? (
            <div className='mt-5 flex flex-col gap-4 sm:flex-row sm:items-start'>
              <ProgramThumbnail thumbnailUrl={data.program.thumbnail_url} />
              <div className='min-w-0 flex-1 space-y-3'>
                <div>
                  <p className='text-foreground text-[13px] font-semibold'>
                    {programLabel !== '—' ? (
                      programLabel
                    ) : (
                      <TableCellEmpty label='No title' />
                    )}
                  </p>
                  <p className='text-muted-foreground mt-0.5 text-xs font-medium'>
                    {programCode !== '—' ? programCode : '—'}
                  </p>
                </div>
                {data.program.id != null ? (
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-9 gap-1.5'
                    asChild
                  >
                    <Link
                      href={ROUTES.ADMIN.MODULES.PROGRAMS.DETAIL(
                        String(data.program.id),
                      )}
                    >
                      View program
                      <ChevronRightIcon className='size-3.5 opacity-70' />
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <p className='text-muted-foreground mt-4 text-sm'>
              No program linked to this request.
            </p>
          )}
        </section>
      </div>

      <section className='border-border max-w-full min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-6'>
        <h2 className='text-foreground text-sm font-semibold'>
          Enrollment pipeline
        </h2>
        <p className='text-muted-foreground mt-1 max-w-3xl text-[13px] leading-relaxed font-medium'>
          High-level lifecycle for this applicant. Detailed answers and legal
          copy stay on intake and contract screens — use these links when you
          need the full records.
        </p>

        <div className='mt-8'>
          <PipelineStepShell
            index={1}
            title='Enrollment request'
            subtitle='Submission and outreach milestones'
          >
            <dl className='grid gap-3 sm:grid-cols-2'>
              <div>
                <dt className='text-muted-foreground text-xs font-semibold'>
                  Workflow status
                </dt>
                <dd className='text-foreground mt-0.5 text-[13px] font-semibold'>
                  {STATUS_LABEL[data.status]}
                </dd>
              </div>
              <div>
                <dt className='text-muted-foreground text-xs font-semibold'>
                  First contacted
                </dt>
                <dd className='text-foreground mt-0.5 text-[13px] font-medium tabular-nums'>
                  {contactedAt ?? <TableCellEmpty label='Not yet' />}
                </dd>
              </div>
              <div>
                <dt className='text-muted-foreground text-xs font-semibold'>
                  Completed at
                </dt>
                <dd className='text-foreground mt-0.5 text-[13px] font-medium tabular-nums'>
                  {requestCompletedAt ?? <TableCellEmpty label='—' />}
                </dd>
              </div>
              <div>
                <dt className='text-muted-foreground text-xs font-semibold'>
                  Cancelled at
                </dt>
                <dd className='text-foreground mt-0.5 text-[13px] font-medium tabular-nums'>
                  {requestCancelledAt ?? <TableCellEmpty label='—' />}
                </dd>
              </div>
            </dl>
          </PipelineStepShell>

          <PipelineStepShell
            index={2}
            title='Onboarding intake'
            subtitle={
              data.onboarding_intake
                ? `${data.onboarding_intake.code?.trim() || `#${data.onboarding_intake.id}`}`
                : 'Not started for this applicant'
            }
          >
            {data.onboarding_intake?.id != null ? (
              <div className='space-y-3'>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='text-foreground inline-flex rounded-md border border-neutral-300 bg-neutral-50 px-2 py-0.5 text-xs font-semibold dark:border-neutral-700 dark:bg-neutral-900'>
                    {formatPipelineLabel(data.onboarding_intake.status)}
                  </span>
                </div>
                <dl className='grid gap-3 sm:grid-cols-2'>
                  <div>
                    <dt className='text-muted-foreground text-xs font-semibold'>
                      Intake completed
                    </dt>
                    <dd className='text-foreground mt-0.5 text-[13px] font-medium'>
                      {formatDateCell(data.onboarding_intake.completed_at) ?? (
                        <TableCellEmpty label='—' />
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className='text-muted-foreground text-xs font-semibold'>
                      Intake cancelled
                    </dt>
                    <dd className='text-foreground mt-0.5 text-[13px] font-medium'>
                      {formatDateCell(data.onboarding_intake.cancelled_at) ?? (
                        <TableCellEmpty label='—' />
                      )}
                    </dd>
                  </div>
                </dl>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-9 gap-1.5'
                  asChild
                >
                  <Link
                    href={ROUTES.ADMIN.MODULES.INTAKE_ASSESSMENTS.DETAIL(
                      String(data.onboarding_intake.id),
                    )}
                  >
                    <FileTextIcon className='size-3.5' />
                    Open intake assessment
                    <ChevronRightIcon className='size-3.5 opacity-70' />
                  </Link>
                </Button>
              </div>
            ) : (
              <p className='text-muted-foreground text-[13px] font-medium'>
                No onboarding intake linked yet. When eligible, staff can begin
                intake from the enrollment requests list.
              </p>
            )}
          </PipelineStepShell>

          <PipelineStepShell
            index={3}
            title='Enrollment contract'
            subtitle={
              data.contract
                ? data.contract.code
                : 'No contract on file for this pipeline'
            }
          >
            {data.contract?.id != null ? (
              <div className='space-y-3'>
                <dl className='grid gap-3 sm:grid-cols-2'>
                  <div>
                    <dt className='text-muted-foreground text-xs font-semibold'>
                      Contract status
                    </dt>
                    <dd className='text-foreground mt-0.5 text-[13px] font-semibold'>
                      {formatPipelineLabel(data.contract.status)}
                    </dd>
                  </div>
                  <div>
                    <dt className='text-muted-foreground text-xs font-semibold'>
                      Sent / signed
                    </dt>
                    <dd className='text-muted-foreground text-[13px] font-medium'>
                      <span className='text-foreground'>
                        {formatDateCell(data.contract.sent_at) ?? '—'}{' '}
                      </span>
                      <span className='opacity-70'>/</span>{' '}
                      <span className='text-foreground'>
                        {formatDateCell(data.contract.signed_at) ?? '—'}
                      </span>
                    </dd>
                  </div>
                </dl>
                {data.contract.voided_at?.trim() ||
                data.contract.void_reason?.trim() ? (
                  <div
                    role='status'
                    className='border-amber-200 bg-amber-50 text-amber-950 rounded-md border px-4 py-3 text-[13px] font-medium dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100'
                  >
                    <span className='block text-xs font-bold tracking-wide uppercase'>
                      Voided contract
                    </span>
                    {data.contract.voided_at?.trim() ? (
                      <p className='mt-1 tabular-nums'>
                        Voided{' '}
                        {formatDateCell(data.contract.voided_at) ?? '—'}
                      </p>
                    ) : null}
                    {data.contract.void_reason?.trim() ? (
                      <p className='mt-1 whitespace-pre-wrap'>
                        {data.contract.void_reason.trim()}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                <Button
                  variant='outline'
                  size='sm'
                  className='h-9 gap-1.5'
                  asChild
                >
                  <Link
                    href={ROUTES.ADMIN.MODULES.ENROLLMENT_CONTRACTS.DETAIL(
                      String(data.contract.id),
                    )}
                  >
                    <ClipboardSignatureIcon className='size-3.5' />
                    Open contract record
                    <ChevronRightIcon className='size-3.5 opacity-70' />
                  </Link>
                </Button>
              </div>
            ) : (
              <p className='text-muted-foreground text-[13px] font-medium'>
                There is no contract linked from this enrollment request yet.
              </p>
            )}
          </PipelineStepShell>

          <PipelineStepShell
            index={4}
            title='Enrollment'
            subtitle={
              enrollmentsList.length > 0
                ? `${enrollmentsList.length} enrollment${enrollmentsList.length === 1 ? '' : 's'} — primary row follows business rules`
                : 'No enrollment created from this pathway yet'
            }
            isLast
          >
            {primaryEnrollment ? (
              <div className='space-y-4'>
                <div className='border-border bg-muted/30 rounded-md border p-4'>
                  <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                    <div>
                      <p className='text-muted-foreground text-xs font-semibold'>
                        Focus enrollment
                      </p>
                      <p className='text-foreground text-[13px] font-bold'>
                        {primaryEnrollment.code}
                      </p>
                      <p className='text-muted-foreground mt-1 text-xs font-medium'>
                        Status:{' '}
                        <span className='text-foreground font-semibold'>
                          {formatPipelineLabel(primaryEnrollment.status)}
                        </span>
                      </p>
                    </div>
                    <Button
                      variant='default'
                      size='sm'
                      className='h-9 shrink-0 gap-1.5 text-[13px]! font-semibold'
                      asChild
                    >
                      <Link
                        href={ROUTES.ADMIN.MODULES.ENROLLMENT_RECORDS.DETAIL(
                          String(primaryEnrollment.id),
                        )}
                      >
                        Open enrollment
                        <ChevronRightIcon className='size-3.5' />
                      </Link>
                    </Button>
                  </div>
                  <dl className='border-border mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2'>
                    <div>
                      <dt className='text-muted-foreground text-xs font-semibold'>
                        Plan dates
                      </dt>
                      <dd className='text-foreground mt-0.5 text-[13px] font-medium tabular-nums'>
                        {formatDateOnly(primaryEnrollment.starts_at) ?? '—'}{' '}
                        <span className='text-muted-foreground'>→</span>{' '}
                        {formatDateOnly(primaryEnrollment.ends_at) ?? '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className='text-muted-foreground text-xs font-semibold'>
                        Completed / cancelled
                      </dt>
                      <dd className='text-muted-foreground text-[13px] font-medium'>
                        <span className='text-foreground'>
                          {formatDateCell(primaryEnrollment.completed_at) ?? '—'}
                        </span>
                        {' / '}
                        <span className='text-foreground'>
                          {formatDateCell(primaryEnrollment.cancelled_at) ?? '—'}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
                {secondaryEnrollments.length > 0 ? (
                  <div>
                    <p className='text-muted-foreground text-xs font-semibold'>
                      Additional enrollments
                    </p>
                    <ul className='border-border divide-border mt-2 divide-y overflow-hidden rounded-md border'>
                      {secondaryEnrollments.map(
                        (row: EnrollmentRequestEnrollmentSummary) => (
                          <li
                            key={row.id}
                            className='hover:bg-muted/40 flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between'
                          >
                            <div>
                              <p className='text-foreground text-[13px] font-semibold'>
                                {row.code}
                              </p>
                              <p className='text-muted-foreground text-xs font-medium'>
                                {formatPipelineLabel(row.status)}
                              </p>
                            </div>
                            <Button
                              variant='outline'
                              size='sm'
                              className='h-8 shrink-0'
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
              <p className='text-muted-foreground text-[13px] font-medium'>
                {data.onboarding_intake
                  ? 'Intake exists, but no enrollment rows are available yet.'
                  : 'Enrollment rows appear after onboarding intake progresses in this pipeline.'}
              </p>
            )}
          </PipelineStepShell>
        </div>
      </section>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <section className='border-border max-w-full min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-6'>
          <h2 className='text-foreground text-sm font-semibold'>Assignment</h2>
          <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
            Last staff handler on this enrollment request record.
          </p>
          {data.handler ? (
            <div className='mt-5 flex items-start gap-4'>
              <Avatar size='default' className='mt-0.5 shrink-0'>
                {handlerPic ? <AvatarImage src={handlerPic} alt='' /> : null}
                <AvatarFallback className='text-xs'>
                  {getInitials(data.handler.name ?? '', 2) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0 flex-1 space-y-1'>
                <p className='text-foreground text-[13px] font-semibold'>
                  {data.handler.name}
                </p>
                <p className='text-muted-foreground text-xs font-medium wrap-break-word'>
                  {data.handler.email}
                </p>
                {data.handler.role?.trim() ? (
                  <p className='text-muted-foreground text-xs font-medium'>
                    {formatRoleLabel(data.handler.role)}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <p className='text-muted-foreground mt-4 text-sm'>
              No handler assigned yet.
            </p>
          )}
        </section>

        <section className='border-border max-w-full min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-6'>
          <h2 className='text-foreground text-sm font-semibold'>Audit cues</h2>
          <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
            Compact ISO-derived milestones for audits (full detail stays on each
            module screen).
          </p>
          <ul className='text-muted-foreground mt-4 space-y-2 text-[12.5px] font-medium'>
            <li>
              Request updated:&nbsp;
              <span className='text-foreground'>
                {formatDateCell(data.timestamps.updated_at) ?? '—'}
              </span>
            </li>
            <li>
              Intake milestones:&nbsp;
              <span className='text-foreground'>
                {data.onboarding_intake
                  ? [
                      formatDateCell(data.onboarding_intake.completed_at),
                      formatDateCell(data.onboarding_intake.cancelled_at),
                    ]
                      .filter(Boolean)
                      .join(' · ') || '—'
                  : '—'}
              </span>
            </li>
            <li>
              Contract signed:&nbsp;
              <span className='text-foreground'>
                {formatDateCell(data.contract?.signed_at) ?? '—'}
              </span>
            </li>
            <li>
              Primary enrollment:&nbsp;
              <span className='text-foreground'>
                {primaryEnrollment
                  ? [
                      formatDateCell(primaryEnrollment.completed_at),
                      formatDateCell(primaryEnrollment.cancelled_at),
                    ]
                      .filter(Boolean)
                      .join(' · ') || primaryEnrollment.code
                  : '—'}
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
