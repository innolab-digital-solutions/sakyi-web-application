'use client';

import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ChevronRightIcon, ClipboardListIcon, FileTextIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { type ReactNode, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TableCellEmpty from '@/components/ui/table-cell-empty';
import { base } from '@/config/api/base';
import { ROUTES } from '@/config/routes';
import {
  getEnrollmentRecordById,
  type AdminEnrollment,
} from '@/domains/enrollment-records/services';
import { getInitials } from '@/lib/utils/string';
import { cn } from '@/lib/utils/styles';

/** Primary white card shell — matches {@link EnrollmentContractDetailView}. */
const CARD_SURFACE =
  'border-border max-w-full min-w-0 rounded-md border bg-white p-6 shadow-xs';

/** Matches admin outline actions on enrollment detail screens. */
const ADMIN_OUTLINE_BUTTON_CLASS =
  'normal-case bg-background hover:bg-muted h-10 shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold';

const METRIC_TILE_CLASS =
  'bg-muted/50 border-border flex min-h-18 flex-col justify-center rounded-md border px-2.5 py-2';

const METRIC_TILE_LABEL_CLASS =
  'text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wide uppercase';

const OVERVIEW_EMPTY_DASH = (
  <span className='text-muted-foreground font-semibold'>-</span>
);

const PROGRAM_THUMBNAIL_FALLBACK = '/images/logo-gray.png';

function EnrollmentRecordDetailSkeleton() {
  return (
    <div className='grid gap-3 lg:grid-cols-3 lg:gap-4'>
      <section className={`${CARD_SURFACE} space-y-5 lg:col-span-2`}>
        <header className='border-border shrink-0 border-b pb-5'>
          <Skeleton className='h-5 w-40 rounded-sm' />
          <Skeleton className='mt-2 h-3 max-w-3xl rounded-sm' />
        </header>
        <div className='space-y-3'>
          <div className='grid gap-1.5 md:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`enrollment-metric-sk-${idx}`}
                className='bg-muted/50 border-border min-h-18 space-y-2 rounded-md border px-2.5 py-2'
              >
                <Skeleton className='h-3 w-28 rounded-sm' />
                <Skeleton className='h-4 w-36 rounded-sm' />
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className='flex min-h-0 min-w-0 flex-col gap-3 lg:gap-4'>
        <section className={`${CARD_SURFACE} flex min-h-0 flex-col`}>
          <header className='border-border border-b pb-4'>
            <Skeleton className='h-5 w-44 rounded-sm' />
            <Skeleton className='mt-2 h-3 max-w-md rounded-sm' />
          </header>
          <div className='flex gap-3 pt-5'>
            <Skeleton className='size-12 shrink-0 rounded-full' />
            <div className='min-w-0 flex-1 space-y-2'>
              <Skeleton className='h-4 w-40 rounded-sm' />
              <Skeleton className='h-3 w-56 rounded-sm' />
            </div>
          </div>
        </section>
        <section className={`${CARD_SURFACE} flex min-h-0 flex-col`}>
          <header className='border-border border-b pb-4'>
            <Skeleton className='h-5 w-48 rounded-sm' />
            <Skeleton className='mt-2 h-3 max-w-md rounded-sm' />
          </header>
          <div className='flex items-start gap-3 pt-5'>
            <Skeleton className='size-12 shrink-0 rounded-md' />
            <div className='min-w-0 flex-1 space-y-2'>
              <Skeleton className='h-4 w-48 rounded-sm' />
              <Skeleton className='h-3 w-28 rounded-sm' />
            </div>
          </div>
        </section>
        <section className={`${CARD_SURFACE} flex min-h-0 flex-col`}>
          <header className='border-border border-b pb-4'>
            <Skeleton className='h-5 w-52 rounded-sm' />
            <Skeleton className='mt-2 h-3 max-w-md rounded-sm' />
          </header>
          <div className='flex flex-col gap-2 pt-5'>
            <Skeleton className='h-10 w-full rounded-md' />
            <Skeleton className='h-10 w-full rounded-md' />
          </div>
        </section>
      </div>
    </div>
  );
}

function EnrollmentMetricTile({
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
    <div className={METRIC_TILE_CLASS}>
      <p className={METRIC_TILE_LABEL_CLASS}>{label}</p>
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

function formatDateCell(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  try {
    return format(parseISO(iso.trim()), 'dd-MMMM-yyyy');
  } catch {
    return iso.trim();
  }
}

function formatStatusLabel(raw: string): string {
  return raw
    .trim()
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

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
  title,
}: {
  thumbnailUrl: string | null | undefined;
  title: string;
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
        alt={title}
        width={48}
        height={48}
        unoptimized={unoptimized}
        className='size-full object-cover'
        onError={() => setUseFallback(true)}
      />
    </div>
  );
}

function getEnrollmentReference(row: AdminEnrollment): string {
  const code = row.code?.trim();
  if (code) return code;
  return `#${row.id}`;
}

function getProgramLabel(data: AdminEnrollment): string {
  if (data.program?.title?.trim()) return data.program.title.trim();
  if (data.program?.slug?.trim()) return data.program.slug.trim();
  return '—';
}

function getProgramCode(data: AdminEnrollment): string {
  const code = data.program?.code?.trim();
  if (code) return code;
  if (data.program?.id != null) return `ID ${data.program.id}`;
  return '—';
}

function EnrollmentCancellationNote({
  cancelledAt,
  note,
}: {
  cancelledAt: string | null | undefined;
  note: string | null | undefined;
}) {
  return (
    <div
      role='status'
      className='border-border bg-muted/35 text-muted-foreground space-y-2.5 rounded-md border p-3 text-[13px] font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]'
    >
      <div className='px-1'>
        <p className={METRIC_TILE_LABEL_CLASS}>Enrollment cancellation</p>
        <div className='text-foreground/90 mt-1 text-[12.5px] leading-snug font-semibold tabular-nums'>
          {formatDateCell(cancelledAt) ?? '—'}
        </div>
      </div>
      <div className='text-foreground/90 space-y-1 px-1 pt-0.5 text-[12.5px] leading-relaxed'>
        {note?.trim() ? (
          <p className='whitespace-pre-wrap'>{note.trim()}</p>
        ) : (
          <p className='text-muted-foreground'>No cancellation note on file.</p>
        )}
      </div>
    </div>
  );
}

export type EnrollmentRecordDetailViewProps = {
  enrollmentId: number;
};

export default function EnrollmentRecordDetailView({
  enrollmentId,
}: EnrollmentRecordDetailViewProps) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['enrollment-record', enrollmentId],
    queryFn: async () => {
      const res = await getEnrollmentRecordById(enrollmentId);
      if (res.status === 'error') {
        throw new Error(res.message || 'Could not load enrollment.');
      }
      return res.data;
    },
  });

  if (isPending) {
    return <EnrollmentRecordDetailSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className='border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-6 text-sm'>
        {error instanceof Error ? error.message : 'Could not load enrollment.'}
      </div>
    );
  }

  const client = data.client;
  const clientPic = resolveClientPictureUrl(client?.picture_url);
  const programLabel = getProgramLabel(data);
  const programCode = getProgramCode(data);
  const lastUpdated = formatDateCell(data.timestamps?.updated_at);
  const completedAt = formatDateCell(data.completed_at);

  return (
    <div className='grid gap-3 lg:grid-cols-3 lg:gap-4'>
      <section className={`${CARD_SURFACE} space-y-5 lg:col-span-2`}>
        <header className='border-border shrink-0 border-b pb-5'>
          <h3 className='text-foreground text-sm font-semibold'>Overview</h3>
          <p className='text-muted-foreground mt-1 max-w-3xl text-[13px] leading-relaxed font-medium'>
            Reference, lifecycle status, program window, completion, and last
            update for this enrollment record.
          </p>
        </header>

        <div className='space-y-3'>
          <div className='grid gap-1.5 md:grid-cols-3'>
            <EnrollmentMetricTile
              label='Enrollment reference'
              value={getEnrollmentReference(data)}
              tabularNums={false}
            />
            <EnrollmentMetricTile
              label='Enrollment status'
              value={formatStatusLabel(data.status || 'unknown')}
              tabularNums={false}
            />
            <EnrollmentMetricTile
              label='Starts'
              value={formatDateCell(data.starts_at) ?? OVERVIEW_EMPTY_DASH}
            />
            <EnrollmentMetricTile
              label='Ends'
              value={formatDateCell(data.ends_at) ?? OVERVIEW_EMPTY_DASH}
            />
            <EnrollmentMetricTile
              label='Completed at'
              value={completedAt ?? OVERVIEW_EMPTY_DASH}
            />
            <EnrollmentMetricTile
              label='Last updated'
              value={lastUpdated ?? OVERVIEW_EMPTY_DASH}
            />
          </div>

          {data.cancelled_at?.trim() || data.status === 'cancelled' ? (
            <EnrollmentCancellationNote
              cancelledAt={data.cancelled_at}
              note={data.cancellation_note}
            />
          ) : null}

          {data.current_active_plan?.id != null ? (
            <div className='border-border space-y-2 border-t pt-5'>
              <p className={METRIC_TILE_LABEL_CLASS}>Active care plan</p>
              <p className='text-foreground/90 text-[12.5px] font-semibold'>
                {data.current_active_plan.code?.trim() ||
                  `Plan #${data.current_active_plan.id}`}
              </p>
              {data.current_active_plan.starts_on?.trim() ||
              data.current_active_plan.ends_on?.trim() ? (
                <p className='text-muted-foreground text-[12px] font-medium tabular-nums'>
                  {formatDateCell(data.current_active_plan.starts_on) ?? '—'}
                  <span className='text-muted-foreground px-1.5 font-medium'>
                    →
                  </span>
                  {formatDateCell(data.current_active_plan.ends_on) ?? '—'}
                </p>
              ) : null}
            </div>
          ) : null}

          {data.notes?.trim() ? (
            <div className='border-border space-y-2 border-t pt-5'>
              <p className={METRIC_TILE_LABEL_CLASS}>Staff notes</p>
              <p className='text-foreground/90 whitespace-pre-wrap text-[12.5px] leading-relaxed font-medium'>
                {data.notes.trim()}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <div className='flex min-h-0 min-w-0 flex-col gap-3 lg:gap-4'>
        <section className={`${CARD_SURFACE} flex min-h-0 flex-col`}>
          <header className='border-border shrink-0 border-b pb-4'>
            <h3 className='text-foreground text-sm font-semibold'>
              Applicant Account
            </h3>
            <p className='text-muted-foreground mt-1 max-w-3xl text-[13px] leading-relaxed font-medium'>
              Person linked to this enrollment. Confirm identity here before
              acting on care plans or schedule changes.
            </p>
          </header>
          {client ? (
            <div className='flex min-h-0 flex-1 flex-col pt-5'>
              <div className='flex min-w-0 items-start gap-3'>
                <Avatar size='lg' className='mt-0.5 shrink-0'>
                  {clientPic ? <AvatarImage src={clientPic} alt='' /> : null}
                  <AvatarFallback className='text-xs'>
                    {getInitials(client.name ?? '', 2) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className='min-w-0 flex-1 space-y-1'>
                  <p className='text-foreground/90 text-[13px] font-semibold'>
                    {client.name?.trim() || (
                      <TableCellEmpty label='No name on file' />
                    )}
                  </p>
                  <p className='text-muted-foreground text-xs leading-snug font-medium wrap-break-word'>
                    {client.email?.trim() || 'No email on file'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className='text-muted-foreground pt-5 text-sm'>
              No applicant account linked to this enrollment.
            </p>
          )}
        </section>

        <section className={`${CARD_SURFACE} flex min-h-0 flex-col`}>
          <header className='border-border shrink-0 border-b pb-4'>
            <h3 className='text-foreground text-sm font-semibold'>
              Requested Program
            </h3>
            <p className='text-muted-foreground mt-1 max-w-3xl text-[13px] leading-relaxed font-medium'>
              Program associated with this enrollment. Use it as the reference
              for care plans and scheduling.
            </p>
          </header>
          {data.program ? (
            <div className='flex min-h-0 flex-1 flex-col gap-4 pt-5'>
              <div className='flex items-start gap-3'>
                <ProgramThumbnail
                  thumbnailUrl={data.program.thumbnail_url}
                  title={programLabel !== '—' ? programLabel : 'Program'}
                />
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
              No program linked to this enrollment.
            </p>
          )}
        </section>

        <section className={`${CARD_SURFACE} flex min-h-0 flex-col`}>
          <header className='border-border shrink-0 border-b pb-4'>
            <h3 className='text-foreground text-sm font-semibold'>
              Related Workflow
            </h3>
            <p className='text-muted-foreground mt-1 max-w-3xl text-[13px] leading-relaxed font-medium'>
              Intake assessment and enrollment contract tied to this record for
              traceability.
            </p>
          </header>
          <div className='flex flex-col gap-2 pt-5'>
            {data.onboarding_intake?.id != null ? (
              <Button
                variant='outline'
                className={`${ADMIN_OUTLINE_BUTTON_CLASS} w-full justify-center`}
                asChild
              >
                <Link
                  href={ROUTES.ADMIN.MODULES.INTAKE_ASSESSMENTS.DETAIL(
                    String(data.onboarding_intake.id),
                  )}
                >
                  <ClipboardListIcon className='size-3.5' />
                  Intake:{' '}
                  {data.onboarding_intake.code?.trim() ||
                    `#${data.onboarding_intake.id}`}
                  <ChevronRightIcon className='size-3.5 opacity-70' />
                </Link>
              </Button>
            ) : (
              <p className='text-muted-foreground text-sm'>No intake linked.</p>
            )}
            {data.enrollment_contract?.id != null ? (
              <Button
                variant='outline'
                className={`${ADMIN_OUTLINE_BUTTON_CLASS} w-full justify-center`}
                asChild
              >
                <Link
                  href={ROUTES.ADMIN.MODULES.ENROLLMENT_CONTRACTS.DETAIL(
                    String(data.enrollment_contract.id),
                  )}
                >
                  <FileTextIcon className='size-3.5' />
                  Contract:{' '}
                  {data.enrollment_contract.code?.trim() ||
                    `#${data.enrollment_contract.id}`}
                  <span className='text-muted-foreground font-medium'>
                    {' '}
                    ({formatStatusLabel(data.enrollment_contract.status)})
                  </span>
                  <ChevronRightIcon className='size-3.5 opacity-70' />
                </Link>
              </Button>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
