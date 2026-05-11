'use client';

import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ExternalLinkIcon, FileIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { type ReactNode, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import { ROUTES } from '@/config/routes';
import { getClientProfileById } from '@/domains/client-profiles/services';
import type {
  AdminEnrollment,
  ClientProfileMedia,
} from '@/domains/client-profiles/types/admin';
import { getInitials } from '@/lib/utils/string';
import { cn } from '@/lib/utils/styles';

/** Primary white card shell — matches enrollment record overview cards. */
const CARD_SURFACE =
  'border-border max-w-full min-w-0 rounded-md border bg-white p-6 shadow-xs';

const METRIC_TILE_CLASS =
  'bg-muted/50 border-border flex min-h-18 flex-col justify-center rounded-md border px-2.5 py-2';

const METRIC_TILE_LABEL_CLASS =
  'text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wide uppercase';

const OVERVIEW_EMPTY_DASH = (
  <span className='text-muted-foreground font-semibold'>-</span>
);

function resolveProfilePictureUrl(
  raw: string | null | undefined,
): string | undefined {
  if (!raw?.trim()) return undefined;
  const t = raw.trim();
  if (t.startsWith('http')) return t;
  return `${base.domainEndpoint}${t}`;
}

/** Media `url` from API may be absolute or storage-relative. */
function resolveMediaPublicUrl(raw: string | null | undefined): string {
  if (!raw?.trim()) return '';
  const t = raw.trim();
  if (t.startsWith('http')) return t;
  return `${base.domainEndpoint}${t}`;
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

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getClientProfileReference(data: {
  client_code?: string | null;
  id: number;
}): string {
  const code = data.client_code?.trim();
  if (code) return code;
  return `#${data.id}`;
}

function enrollmentProgramLabel(e: AdminEnrollment): string {
  const t = e.program?.title?.trim();
  if (t) return t;
  const c = e.program?.code?.trim();
  if (c) return c;
  return '—';
}

function isImageMime(mime: string): boolean {
  return mime.trim().toLowerCase().startsWith('image/');
}

function ClientProfileMetricTile({
  label,
  value,
  tabularNums = true,
  valueClassName,
  className,
}: {
  label: string;
  value: ReactNode;
  tabularNums?: boolean;
  valueClassName?: string;
  /** e.g. `md:col-span-3` for full-width tiles. */
  className?: string;
}) {
  return (
    <div className={cn(METRIC_TILE_CLASS, className)}>
      <p className={METRIC_TILE_LABEL_CLASS}>{label}</p>
      <div
        className={cn(
          'text-foreground/90 text-[12.5px] leading-snug font-semibold wrap-break-word',
          tabularNums && 'tabular-nums',
          valueClassName,
        )}
      >
        {value}
      </div>
    </div>
  );
}

function ClientProfileDetailSkeleton() {
  return (
    <div className='grid gap-3 lg:grid-cols-3 lg:gap-4'>
      <section className={`${CARD_SURFACE} space-y-5 lg:col-span-2`}>
        <header className='border-border shrink-0 border-b pb-5'>
          <Skeleton className='h-5 w-32 rounded-sm' />
          <Skeleton className='mt-2 h-3 max-w-3xl rounded-sm' />
        </header>
        <div className='grid gap-1.5 md:grid-cols-3'>
          {Array.from({ length: 7 }).map((_, idx) => (
            <div
              key={`cp-metric-sk-${idx}`}
              className={cn(
                'bg-muted/50 border-border min-h-18 space-y-2 rounded-md border px-2.5 py-2',
                idx === 6 ? 'md:col-span-3' : undefined,
              )}
            >
              <Skeleton className='h-3 w-24 rounded-sm' />
              <Skeleton className='h-4 w-28 rounded-sm' />
            </div>
          ))}
        </div>
        <div className='border-border space-y-2 border-t pt-5'>
          <Skeleton className='h-3 w-36 rounded-sm' />
          <Skeleton className='h-20 w-full rounded-sm' />
        </div>
      </section>
      <div className='flex min-h-0 min-w-0 flex-col gap-3 lg:gap-4'>
        <section className={`${CARD_SURFACE} flex min-h-0 flex-col`}>
          <header className='border-border border-b pb-4'>
            <Skeleton className='h-5 w-36 rounded-sm' />
            <Skeleton className='mt-2 h-3 max-w-md rounded-sm' />
          </header>
          <div className='flex gap-3 pt-5'>
            <Skeleton className='size-12 shrink-0 rounded-full' />
            <div className='min-w-0 flex-1 space-y-2'>
              <Skeleton className='h-4 w-40 rounded-sm' />
              <Skeleton className='h-3 w-52 rounded-sm' />
            </div>
          </div>
        </section>
        <section className={`${CARD_SURFACE} flex min-h-0 flex-col`}>
          <header className='border-border border-b pb-4'>
            <Skeleton className='h-5 w-32 rounded-sm' />
            <Skeleton className='mt-2 h-3 max-w-sm rounded-sm' />
          </header>
          <div className='flex gap-3 pt-5'>
            <Skeleton className='size-12 shrink-0 rounded-md' />
            <div className='min-w-0 flex-1 space-y-2'>
              <Skeleton className='h-3 w-full rounded-sm' />
              <Skeleton className='h-3 w-2/3 rounded-sm' />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function MediaAttachmentRow({ item }: { item: ClientProfileMedia }) {
  const href = resolveMediaPublicUrl(item.url);
  const isImage = isImageMime(item.mime_type);
  const [imgFailed, setImgFailed] = useState(() => !href);
  const unoptimized =
    !!href &&
    (href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.includes('localhost'));

  return (
    <li className='border-border flex min-w-0 gap-3 border-b py-4 last:border-b-0'>
      <div className='bg-muted border-border relative size-14 shrink-0 overflow-hidden rounded-md border'>
        {isImage && href && !imgFailed ? (
          <Image
            src={href}
            alt={item.label?.trim() || item.original_name || 'Attachment'}
            width={56}
            height={56}
            className='size-full object-cover'
            unoptimized={unoptimized}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className='flex size-full items-center justify-center'>
            <FileIcon className='text-muted-foreground size-6' aria-hidden />
          </div>
        )}
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-foreground text-[13px] font-semibold'>
          {item.label?.trim() || item.original_name?.trim() || 'Attachment'}
        </p>
        {item.original_name?.trim() &&
        item.original_name.trim() !== item.label?.trim() ? (
          <p className='text-muted-foreground truncate text-[12px] font-medium'>
            {item.original_name.trim()}
          </p>
        ) : null}
        <p className='text-muted-foreground mt-0.5 text-[11px] font-medium'>
          {[item.mime_type, formatFileSize(item.size_bytes)]
            .filter(Boolean)
            .join(' · ') || '—'}
        </p>
        {href ? (
          <Button
            variant='ghost'
            size='sm'
            className='text-foreground h-8 gap-1 px-0 text-[12px] font-semibold'
            asChild
          >
            <a href={href} target='_blank' rel='noopener noreferrer'>
              Open file
              <ExternalLinkIcon className='size-3.5' aria-hidden />
            </a>
          </Button>
        ) : (
          <p className='text-muted-foreground mt-1 text-xs'>
            Missing file URL.
          </p>
        )}
      </div>
    </li>
  );
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
    return <ClientProfileDetailSkeleton />;
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
  const mediaItems = Array.isArray(data.media) ? data.media : [];
  const profilePhone = data.profile?.contact_phone?.trim();
  const focusName = data.profile?.focus?.name?.trim();
  const contactEmail = data.profile?.contact_email?.trim();
  const gender = data.profile?.gender?.trim();
  const dobFormatted = data.profile?.dob?.trim()
    ? (formatDateCell(data.profile.dob) ?? data.profile.dob.trim())
    : null;
  const address = data.profile?.address?.trim();

  return (
    <div className='grid gap-3 lg:grid-cols-3 lg:gap-4'>
      <section className={`${CARD_SURFACE} space-y-5 lg:col-span-2`}>
        <header className='border-border shrink-0 border-b pb-5'>
          <h3 className='text-foreground text-sm font-semibold'></h3>
          <p className='text-muted-foreground mt-1 max-w-3xl text-[13px] leading-relaxed font-medium'></p>
        </header>

        <div className='space-y-3'>
          <div className='grid gap-1.5 md:grid-cols-3'>
            <ClientProfileMetricTile
              label='Client reference'
              value={getClientProfileReference(data)}
              tabularNums={false}
            />
            <ClientProfileMetricTile
              label='Account email'
              value={
                data.email?.trim() ? data.email.trim() : OVERVIEW_EMPTY_DASH
              }
              tabularNums={false}
            />
            <ClientProfileMetricTile
              label='Contact phone'
              value={profilePhone ? profilePhone : OVERVIEW_EMPTY_DASH}
              tabularNums={false}
            />
            <ClientProfileMetricTile
              label='Contact email'
              value={contactEmail ? contactEmail : OVERVIEW_EMPTY_DASH}
              tabularNums={false}
            />
            <ClientProfileMetricTile
              label='Gender'
              value={gender ? formatStatusLabel(gender) : OVERVIEW_EMPTY_DASH}
              tabularNums={false}
            />
            <ClientProfileMetricTile
              label='Date of birth'
              value={dobFormatted ?? OVERVIEW_EMPTY_DASH}
              tabularNums={false}
            />
            <ClientProfileMetricTile
              label='Address'
              value={address ? address : OVERVIEW_EMPTY_DASH}
              tabularNums={false}
              valueClassName='whitespace-pre-wrap'
              className='min-h-18 justify-start md:col-span-3'
            />
          </div>

          {focusName || data.profile?.focus ? (
            <div className='border-border space-y-2 border-t pt-5'>
              <p className={METRIC_TILE_LABEL_CLASS}>Wellness focus</p>
              <p className='text-foreground/90 text-[12.5px] font-semibold'>
                {focusName ||
                  (data.profile?.focus?.id != null
                    ? `Focus ID ${data.profile.focus.id}`
                    : '—')}
              </p>
            </div>
          ) : null}

          <div className='border-border border-t pt-5'>
            <div className='border-border overflow-hidden rounded-md border'>
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
                          <Link
                            className='text-foreground hover:text-primary inline-flex wrap-break-word underline-offset-4 hover:underline'
                            href={ROUTES.ADMIN.MODULES.ENROLLMENT_RECORDS.DETAIL(
                              String(e.id),
                            )}
                          >
                            {e.code?.trim() || `#${e.id}`}
                          </Link>
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
          </div>
        </div>
      </section>

      <div className='flex min-h-0 min-w-0 flex-col gap-3 lg:gap-4'>
        <section className={`${CARD_SURFACE} flex min-h-0 flex-col`}>
          <header className='border-border shrink-0 border-b pb-4'>
            <h3 className='text-foreground text-sm font-semibold'>
              Client Account
            </h3>
            <p className='text-muted-foreground mt-1 max-w-3xl text-[13px] leading-relaxed font-medium'>
              Primary identity and sign-in channel. Match this avatar and email
              before acting on downstream enrollments or care plans.
            </p>
          </header>
          <div className='flex min-h-0 flex-1 flex-col pt-5'>
            <div className='flex min-w-0 items-start gap-3'>
              <Avatar size='lg' className='mt-0.5 shrink-0'>
                {pictureSrc ? <AvatarImage src={pictureSrc} alt='' /> : null}
                <AvatarFallback className='text-xs'>
                  {getInitials(data.name ?? '', 2) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0 flex-1 space-y-1'>
                <p className='text-foreground/90 text-[13px] font-semibold'>
                  {data.name?.trim() || (
                    <TableCellEmpty label='No name on file' />
                  )}
                </p>
                <p className='text-muted-foreground text-xs leading-snug font-medium wrap-break-word'>
                  {data.email?.trim() || 'No email on file'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${CARD_SURFACE} flex min-h-0 flex-col`}>
          <header className='border-border shrink-0 border-b pb-4'>
            <h3 className='text-foreground text-sm font-semibold'>
              Profile Media
            </h3>
            <p className='text-muted-foreground mt-1 max-w-3xl text-[13px] leading-relaxed font-medium'>
              Documents and uploads associated with this client profile. Open
              files in a new tab to review originals.
            </p>
          </header>
          <div className='min-h-0 flex-1 pt-5'>
            {mediaItems.length === 0 ? (
              <p className='text-muted-foreground text-sm'>
                No media files are attached to this profile yet.
              </p>
            ) : (
              <ul className='m-0 list-none p-0'>
                {mediaItems.map((m) => (
                  <MediaAttachmentRow key={m.id} item={m} />
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
