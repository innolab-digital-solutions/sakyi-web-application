'use client';

import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TableCellEmpty from '@/components/ui/table-cell-empty';
import { base } from '@/config/api/base';
import { getClientProfileById } from '@/domains/client-profiles/services';
import type { AdminEnrollment } from '@/domains/client-profiles/types/admin';
import { getInitials } from '@/lib/utils/string';

function resolveProfilePictureUrl(
  raw: string | null | undefined,
): string | undefined {
  if (!raw?.trim()) return undefined;
  const t = raw.trim();
  if (t.startsWith('http')) return t;
  return `${base.domainEndpoint}${t}`;
}

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

function enrollmentProgramLabel(e: AdminEnrollment): string {
  const t = e.program?.title?.trim();
  if (t) return t;
  const c = e.program?.code?.trim();
  if (c) return c;
  return '—';
}

export type ClientProfileDetailViewProps = {
  profileId: number;
};

export default function ClientProfileDetailView({
  profileId,
}: ClientProfileDetailViewProps) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['client-profile', profileId],
    queryFn: async () => {
      const res = await getClientProfileById(profileId);
      if (res.status === 'error') {
        throw new Error(res.message || 'Could not load client profile.');
      }
      return res.data;
    },
  });

  if (isPending) {
    return (
      <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
        Loading profile…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className='border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-6 text-sm'>
        {error instanceof Error ? error.message : 'Could not load profile.'}
      </div>
    );
  }

  const pictureSrc = resolveProfilePictureUrl(data.profile?.picture_url);
  const enrollments = data.enrollments ?? [];

  return (
    <div className='space-y-6'>
      <section className='border-border max-w-full min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-5'>
        <h2 className='text-foreground text-sm font-semibold'>Account</h2>
        <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
          Primary identity and sign-in email for this client.
        </p>
        <div className='mt-5 flex flex-col gap-4 sm:flex-row sm:items-start'>
          <Avatar size='lg' className='size-16 shrink-0' aria-hidden>
            {pictureSrc ? <AvatarImage src={pictureSrc} alt='' /> : null}
            <AvatarFallback className='text-sm'>
              {getInitials(data.name ?? '', 2) || '?'}
            </AvatarFallback>
          </Avatar>
          <dl className='grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2'>
            <div>
              <dt className='text-muted-foreground text-xs font-semibold'>
                Name
              </dt>
              <dd className='text-foreground mt-0.5 text-[13px] font-semibold'>
                {data.name?.trim() || '—'}
              </dd>
            </div>
            <div>
              <dt className='text-muted-foreground text-xs font-semibold'>
                Email
              </dt>
              <dd className='text-foreground mt-0.5 text-[13px] font-medium wrap-break-word'>
                {data.email?.trim() || '—'}
              </dd>
            </div>
            <div>
              <dt className='text-muted-foreground text-xs font-semibold'>
                Client code
              </dt>
              <dd className='text-foreground mt-0.5 text-[13px] font-medium'>
                {data.client_code?.trim() || '—'}
              </dd>
            </div>
            <div>
              <dt className='text-muted-foreground text-xs font-semibold'>
                Enrollments
              </dt>
              <dd className='text-foreground mt-0.5 text-[13px] font-medium tabular-nums'>
                {data.enrollments_count ?? enrollments.length}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {data.profile &&
      (data.profile.contact_phone ||
        data.profile.contact_email ||
        data.profile.dob ||
        data.profile.gender ||
        data.profile.address ||
        data.profile.focus) ? (
        <section className='border-border max-w-full min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-5'>
          <h2 className='text-foreground text-sm font-semibold'>Profile</h2>
          <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
            Extended contact and wellness focus from onboarding.
          </p>
          <dl className='mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2'>
            {data.profile.contact_phone?.trim() ? (
              <div>
                <dt className='text-muted-foreground text-xs font-semibold'>
                  Phone
                </dt>
                <dd className='text-foreground mt-0.5 text-[13px] font-medium'>
                  {data.profile.contact_phone.trim()}
                </dd>
              </div>
            ) : null}
            {data.profile.contact_email?.trim() ? (
              <div>
                <dt className='text-muted-foreground text-xs font-semibold'>
                  Contact email
                </dt>
                <dd className='text-foreground mt-0.5 text-[13px] font-medium wrap-break-word'>
                  {data.profile.contact_email.trim()}
                </dd>
              </div>
            ) : null}
            {data.profile.dob?.trim() ? (
              <div>
                <dt className='text-muted-foreground text-xs font-semibold'>
                  Date of birth
                </dt>
                <dd className='text-foreground mt-0.5 text-[13px] font-medium'>
                  {formatDateCell(data.profile.dob) ?? data.profile.dob.trim()}
                </dd>
              </div>
            ) : null}
            {data.profile.gender?.trim() ? (
              <div>
                <dt className='text-muted-foreground text-xs font-semibold'>
                  Gender
                </dt>
                <dd className='text-foreground mt-0.5 text-[13px] font-medium'>
                  {data.profile.gender.trim()}
                </dd>
              </div>
            ) : null}
            {data.profile.address?.trim() ? (
              <div className='sm:col-span-2'>
                <dt className='text-muted-foreground text-xs font-semibold'>
                  Address
                </dt>
                <dd className='text-foreground mt-0.5 text-[13px] font-medium whitespace-pre-wrap'>
                  {data.profile.address.trim()}
                </dd>
              </div>
            ) : null}
            {data.profile.focus ? (
              <div>
                <dt className='text-muted-foreground text-xs font-semibold'>
                  Focus
                </dt>
                <dd className='text-foreground mt-0.5 text-[13px] font-medium'>
                  {data.profile.focus.name?.trim() ||
                    `ID ${data.profile.focus.id}`}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      <section className='border-border max-w-full min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-5'>
        <h2 className='text-foreground text-sm font-semibold'>Enrollments</h2>
        <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
          Programs this client is or was enrolled in.
        </p>
        <div className='mt-5 overflow-x-auto'>
          <Table>
            <TableHeader className='bg-muted/50 [&_tr]:border-border'>
              <TableRow className='border-border hover:bg-transparent'>
                <TableHead>Reference</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='tabular-nums'>Starts</TableHead>
                <TableHead className='tabular-nums'>Ends</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className='text-muted-foreground py-8 text-center text-sm'
                  >
                    No enrollments linked to this profile yet.
                  </TableCell>
                </TableRow>
              ) : (
                enrollments.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className='text-[13px] font-semibold'>
                      {e.code?.trim() || `#${e.id}`}
                    </TableCell>
                    <TableCell className='text-[13px] font-medium'>
                      {enrollmentProgramLabel(e) !== '—' ? (
                        enrollmentProgramLabel(e)
                      ) : (
                        <TableCellEmpty label='No program' />
                      )}
                    </TableCell>
                    <TableCell>
                      <span className='border-border bg-muted/60 text-foreground inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold'>
                        {formatStatusLabel(e.status || 'unknown')}
                      </span>
                    </TableCell>
                    <TableCell className='text-foreground/80 text-[13px] tabular-nums'>
                      {formatDateCell(e.starts_at) ?? (
                        <TableCellEmpty label='—' />
                      )}
                    </TableCell>
                    <TableCell className='text-foreground/80 text-[13px] tabular-nums'>
                      {formatDateCell(e.ends_at) ?? (
                        <TableCellEmpty label='—' />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
