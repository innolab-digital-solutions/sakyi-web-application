'use client';

import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ChevronRightIcon, ExternalLinkIcon, FileIcon } from 'lucide-react';
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

/** Matches admin outline workflow links (enrollment contract detail). */
const ADMIN_OUTLINE_WORKFLOW_LINK_CLASS =
  'inline-flex normal-case bg-background hover:bg-muted h-10 w-full shrink-0 items-center justify-between gap-2 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold';

/** Matches list row outline actions (client profile “View detail” pattern). */
const OPEN_FILE_BUTTON_CLASS =
  'normal-case bg-background hover:bg-muted text-foreground h-9 shrink-0 gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold';

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

function getEnrollmentCode(e: AdminEnrollment): string {
  const c = e.code?.trim();
  if (c) return c;
  return `#${e.id}`;
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
        <div className='border-border space-y-3 border-t pt-5'>
          <Skeleton className='h-5 w-40 rounded-sm' />
          <Skeleton className='h-3 max-w-md rounded-sm' />
          <Skeleton className='h-32 w-full rounded-md' />
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
            <Skeleton className='h-5 w-40 rounded-sm' />
            <Skeleton className='mt-2 h-3 max-w-sm rounded-sm' />
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

function ProfileMediaTableRow({ item }: { item: ClientProfileMedia }) {
  const href = resolveMediaPublicUrl(item.url);
  const isImage = isImageMime(item.mime_type);
  const [imgFailed, setImgFailed] = useState(() => !href);
  const unoptimized =
    !!href &&
    (href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.includes('localhost'));
  const fileName =
    item.original_name?.trim() || item.label?.trim() || 'Untitled file';
  const typeAndSize =
    [item.mime_type, formatFileSize(item.size_bytes)]
      .filter(Boolean)
      .join(' · ') || '—';

  return (
    <TableRow>
      <TableCell className='min-w-52'>
        <div className='flex min-w-0 items-center gap-3'>
          <div className='bg-muted border-border relative size-11 shrink-0 overflow-hidden rounded-md border'>
            {isImage && href && !imgFailed ? (
              <Image
                src={href}
                alt=''
                width={44}
                height={44}
                className='size-full object-cover'
                unoptimized={unoptimized}
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className='flex size-full items-center justify-center'>
                <FileIcon className='text-muted-foreground size-5' aria-hidden />
              </div>
            )}
          </div>
          <p className='text-foreground min-w-0 flex-1 text-[13px] leading-snug font-semibold wrap-break-word'>
            {fileName}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <span className='text-[13px] font-medium'>{typeAndSize}</span>
      </TableCell>
      <TableCell className='align-center text-end whitespace-nowrap'>
        {href ? (
          <Button variant='outline' size='sm' className={OPEN_FILE_BUTTON_CLASS} asChild>
            <a
              href={href}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-1.5'
            >
              Open
              <ExternalLinkIcon className='size-3.5 shrink-0' aria-hidden />
            </a>
          </Button>
        ) : (
          <TableCellEmpty label='No link' />
        )}
      </TableCell>
    </TableRow>
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
          <h3 className='text-foreground text-sm font-semibold'>
            Client Profile
          </h3>
          <p className='text-muted-foreground mt-1 max-w-3xl text-[13px] leading-relaxed font-medium'>
            Identity and intake fields below; uploaded files in the media table.
            Enrollment codes are listed beside the account card.
          </p>
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

          <div className='border-border space-y-5 border-t pt-5'>
            <header className='border-border shrink-0 border-b pb-4'>
              <h3 className='text-foreground text-sm font-semibold'>
                Profile media
              </h3>
              <p className='text-muted-foreground mt-1 max-w-3xl text-[13px] leading-relaxed font-medium'>
                Files attached to this client profile. Open a row to view the
                original in a new tab.
              </p>
            </header>
            <div className='border-border overflow-hidden rounded-md border'>
              <Table>
                <TableHeader className='bg-muted/50 [&_tr]:border-border'>
                  <TableRow className='border-border hover:bg-transparent'>
                    <TableHead>File</TableHead>
                    <TableHead>Type · size</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mediaItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className='text-muted-foreground py-10 text-center text-sm'
                      >
                        No media files are attached to this profile yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    mediaItems.map((m) => (
                      <ProfileMediaTableRow key={m.id} item={m} />
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
              Program Enrollments
            </h3>
            <p className='text-muted-foreground mt-1 max-w-3xl text-[13px] leading-relaxed font-medium'>
              Each code opens the enrollment record overview for that program.
            </p>
          </header>
          <div className='flex min-h-0 flex-1 flex-col gap-2 pt-5'>
            {enrollments.length === 0 ? (
              <p className='text-muted-foreground text-sm'>
                No enrollments linked to this profile yet.
              </p>
            ) : (
              enrollments.map((e) => (
                <Button
                  key={e.id}
                  variant='outline'
                  className={ADMIN_OUTLINE_WORKFLOW_LINK_CLASS}
                  asChild
                >
                  <Link
                    href={ROUTES.ADMIN.MODULES.ENROLLMENT_RECORDS.DETAIL(
                      String(e.id),
                    )}
                  >
                    <span className='text-foreground min-w-0 truncate font-semibold tabular-nums'>
                      {getEnrollmentCode(e)}
                    </span>
                    <ChevronRightIcon
                      className='text-foreground/70 size-3.5 shrink-0'
                      aria-hidden
                    />
                  </Link>
                </Button>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
