'use client';

import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { type ComponentType } from 'react';
import {
  CheckCircle2Icon,
  PhoneCallIcon,
  TimerResetIcon,
  XCircleIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import TableCellEmpty from '@/components/ui/table-cell-empty';
import { base } from '@/config/api/base';
import { ROUTES } from '@/config/routes';
import { getEnrollmentRequestById } from '@/domains/enrollment-requests/services';
import type {
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

function formatRoleLabel(role: string): string {
  return role
    .trim()
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
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
    return (
      <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
        Loading enrollment request…
      </div>
    );
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
  const receivedAt = formatDateCell(data.timestamps?.created_at);
  const updatedAt = formatDateCell(data.timestamps?.updated_at);
  const contactedAt = formatDateCell(data.contacted_at);
  const clientPic = resolveClientPictureUrl(data.client?.picture_url);
  const handlerPic = data.handler
    ? resolveClientPictureUrl(data.handler.picture_url)
    : undefined;
  const programLabel = getProgramLabel(data);
  const programCode = getProgramCode(data);

  return (
    <div className='space-y-6'>
      <section className='border-border max-w-full min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-5'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <h2 className='text-foreground text-sm font-semibold'>Request</h2>
            <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
              Reference, workflow status, and key dates for this submission.
            </p>
          </div>
          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${statusStyle.className}`}
          >
            <StatusIcon className='size-3.5 shrink-0' />
            {STATUS_LABEL[data.status]}
          </span>
        </div>
        <dl className='mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <div>
            <dt className='text-muted-foreground text-xs font-semibold'>
              Reference
            </dt>
            <dd className='text-foreground mt-0.5 text-[13px] font-semibold'>
              {getRequestReference(data)}
            </dd>
          </div>
          <div>
            <dt className='text-muted-foreground text-xs font-semibold'>
              Contact phone
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
              Last updated
            </dt>
            <dd className='text-foreground mt-0.5 text-[13px] font-medium tabular-nums'>
              {updatedAt ?? <TableCellEmpty label='—' />}
            </dd>
          </div>
        </dl>
        {data.notes?.trim() ? (
          <div className='border-border mt-5 border-t pt-5'>
            <dt className='text-muted-foreground text-xs font-semibold'>
              Notes
            </dt>
            <dd className='text-foreground mt-1 whitespace-pre-wrap text-[13px] font-medium'>
              {data.notes.trim()}
            </dd>
          </div>
        ) : null}
      </section>

      <section className='border-border max-w-full min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-5'>
        <h2 className='text-foreground text-sm font-semibold'>Applicant</h2>
        <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
          Client attached to this enrollment request.
        </p>
        {data.client ? (
          <div className='mt-5 flex items-start gap-4'>
            <Avatar size='lg' className='size-14 shrink-0'>
              {clientPic ? <AvatarImage src={clientPic} alt='' /> : null}
              <AvatarFallback className='text-sm'>
                {getInitials(data.client.name ?? '', 2) || '?'}
              </AvatarFallback>
            </Avatar>
            <dl className='min-w-0 flex-1 space-y-2'>
              <div>
                <dt className='text-muted-foreground text-xs font-semibold'>
                  Name
                </dt>
                <dd className='text-foreground text-[13px] font-semibold'>
                  {data.client.name?.trim() || '—'}
                </dd>
              </div>
              <div>
                <dt className='text-muted-foreground text-xs font-semibold'>
                  Email
                </dt>
                <dd className='text-foreground wrap-break-word text-[13px] font-medium'>
                  {data.client.email?.trim() || '—'}
                </dd>
              </div>
              {data.client.id != null ? (
                <div className='pt-1'>
                  <Button variant='outline' size='sm' className='h-9' asChild>
                    <Link
                      href={ROUTES.ADMIN.MODULES.CLIENT_PROFILES.DETAIL(
                        String(data.client.id),
                      )}
                    >
                      Open client profile
                    </Link>
                  </Button>
                </div>
              ) : null}
            </dl>
          </div>
        ) : (
          <p className='text-muted-foreground mt-4 text-sm'>
            No client linked to this request.
          </p>
        )}
      </section>

      <section className='border-border max-w-full min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-5'>
        <h2 className='text-foreground text-sm font-semibold'>
          Requested program
        </h2>
        <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
          Program the applicant selected when submitting this request.
        </p>
        {data.program ? (
          <div className='mt-5 flex items-start gap-4'>
            <ProgramThumbnail thumbnailUrl={data.program.thumbnail_url} />
            <div className='min-w-0 flex-1 space-y-1'>
              <p className='text-foreground text-[13px] font-semibold'>
                {programLabel !== '—' ? (
                  programLabel
                ) : (
                  <TableCellEmpty label='No title' />
                )}
              </p>
              <p className='text-muted-foreground text-xs font-medium'>
                {programCode !== '—' ? programCode : '—'}
              </p>
            </div>
          </div>
        ) : (
          <p className='text-muted-foreground mt-4 text-sm'>
            No program linked to this request.
          </p>
        )}
      </section>

      <section className='border-border max-w-full min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-5'>
        <h2 className='text-foreground text-sm font-semibold'>Assignment</h2>
        <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
          Staff member responsible for triage and follow-up.
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
              <p className='text-muted-foreground wrap-break-word text-xs font-medium'>
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

      <section className='border-border max-w-full min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-5'>
        <h2 className='text-foreground text-sm font-semibold'>Intake</h2>
        <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
          Onboarding intake created from this request, if any.
        </p>
        {data.onboarding_intake?.id != null ? (
          <div className='mt-5'>
            <Button variant='outline' size='sm' className='h-9' asChild>
              <Link
                href={ROUTES.ADMIN.MODULES.INTAKE_ASSESSMENTS.DETAIL(
                  String(data.onboarding_intake.id),
                )}
              >
                {data.onboarding_intake.code?.trim() ||
                  `Intake #${data.onboarding_intake.id}`}
              </Link>
            </Button>
          </div>
        ) : (
          <p className='text-muted-foreground mt-4 text-sm'>
            No intake assessment linked yet.
          </p>
        )}
      </section>
    </div>
  );
}
