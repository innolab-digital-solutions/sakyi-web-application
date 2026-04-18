'use client';

import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import TableCellEmpty from '@/components/ui/table-cell-empty';
import { ROUTES } from '@/config/routes';
import { getEnrollmentRecordById } from '@/domains/enrollment-records/services';

function formatDateCell(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  try {
    return format(parseISO(iso), 'dd-MMMM-yyyy');
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
    return (
      <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
        Loading enrollment…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className='border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-6 text-sm'>
        {error instanceof Error ? error.message : 'Could not load enrollment.'}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <section className='border-border max-w-full min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-5'>
        <h2 className='text-foreground text-sm font-semibold'>Enrollment</h2>
        <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
          Reference, lifecycle status, and schedule for this program enrollment.
        </p>
        <dl className='mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <div>
            <dt className='text-muted-foreground text-xs font-semibold'>
              Reference
            </dt>
            <dd className='text-foreground mt-0.5 text-[13px] font-semibold'>
              {data.code?.trim() || `#${data.id}`}
            </dd>
          </div>
          <div>
            <dt className='text-muted-foreground text-xs font-semibold'>
              Status
            </dt>
            <dd className='mt-0.5'>
              <span className='border-border bg-muted/60 text-foreground inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold'>
                {formatStatusLabel(data.status || 'unknown')}
              </span>
            </dd>
          </div>
          <div>
            <dt className='text-muted-foreground text-xs font-semibold'>
              Starts
            </dt>
            <dd className='text-foreground mt-0.5 text-[13px] font-medium tabular-nums'>
              {formatDateCell(data.starts_at) ?? '—'}
            </dd>
          </div>
          <div>
            <dt className='text-muted-foreground text-xs font-semibold'>
              Ends
            </dt>
            <dd className='text-foreground mt-0.5 text-[13px] font-medium tabular-nums'>
              {formatDateCell(data.ends_at) ?? '—'}
            </dd>
          </div>
          <div>
            <dt className='text-muted-foreground text-xs font-semibold'>
              Completed
            </dt>
            <dd className='text-foreground mt-0.5 text-[13px] font-medium tabular-nums'>
              {formatDateCell(data.completed_at) ?? '—'}
            </dd>
          </div>
          <div>
            <dt className='text-muted-foreground text-xs font-semibold'>
              Cancelled
            </dt>
            <dd className='text-foreground mt-0.5 text-[13px] font-medium tabular-nums'>
              {formatDateCell(data.cancelled_at) ?? '—'}
            </dd>
          </div>
          {data.cancellation_note?.trim() ? (
            <div className='sm:col-span-2'>
              <dt className='text-muted-foreground text-xs font-semibold'>
                Cancellation note
              </dt>
              <dd className='text-foreground mt-0.5 text-[13px] font-medium whitespace-pre-wrap'>
                {data.cancellation_note.trim()}
              </dd>
            </div>
          ) : null}
          {data.notes?.trim() ? (
            <div className='sm:col-span-2'>
              <dt className='text-muted-foreground text-xs font-semibold'>
                Notes
              </dt>
              <dd className='text-foreground mt-0.5 text-[13px] font-medium whitespace-pre-wrap'>
                {data.notes.trim()}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className='border-border max-w-full min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-5'>
        <h2 className='text-foreground text-sm font-semibold'>Related</h2>
        <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
          Client profile, intake assessment, and contract linked to this
          enrollment.
        </p>
        <ul className='mt-5 space-y-3 text-[13px]'>
          <li className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
            <span className='text-muted-foreground font-semibold'>Client</span>
            {data.client?.id != null ? (
              <Button variant='outline' size='sm' className='h-9 w-fit' asChild>
                <Link
                  href={ROUTES.ADMIN.MODULES.CLIENT_PROFILES.DETAIL(
                    String(data.client.id),
                  )}
                >
                  {data.client.name?.trim() ||
                    data.client.client_code ||
                    'View profile'}
                </Link>
              </Button>
            ) : (
              <TableCellEmpty label='No client linked' />
            )}
          </li>
          <li className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
            <span className='text-muted-foreground font-semibold'>
              Intake assessment
            </span>
            {data.onboarding_intake?.id != null ? (
              <Button variant='outline' size='sm' className='h-9 w-fit' asChild>
                <Link
                  href={ROUTES.ADMIN.MODULES.INTAKE_ASSESSMENTS.DETAIL(
                    String(data.onboarding_intake.id),
                  )}
                >
                  {data.onboarding_intake.code?.trim() ||
                    `Intake #${data.onboarding_intake.id}`}
                </Link>
              </Button>
            ) : (
              <TableCellEmpty label='No intake linked' />
            )}
          </li>
          <li className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
            <span className='text-muted-foreground font-semibold'>
              Contract
            </span>
            {data.enrollment_contract?.id != null ? (
              <Button variant='outline' size='sm' className='h-9 w-fit' asChild>
                <Link
                  href={ROUTES.ADMIN.MODULES.ENROLLMENT_CONTRACTS.DETAIL(
                    String(data.enrollment_contract.id),
                  )}
                >
                  {data.enrollment_contract.code?.trim() ||
                    `Contract #${data.enrollment_contract.id}`}{' '}
                  <span className='text-muted-foreground font-normal'>
                    ({formatStatusLabel(data.enrollment_contract.status)})
                  </span>
                </Link>
              </Button>
            ) : (
              <TableCellEmpty label='No contract linked' />
            )}
          </li>
        </ul>
      </section>
    </div>
  );
}
