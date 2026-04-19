'use client';

import { format, parseISO } from 'date-fns';
import { CircleDotIcon, MarsIcon, VenusIcon } from 'lucide-react';
import { type ComponentType, useEffect, useMemo, useState } from 'react';

import TableListShell from '@/components/admin/layout/TableListShell';
import ClientProfileFilters from '@/components/admin/modules/client-profiles/ClientProfileFilters';
import ClientProfileRowActions from '@/components/admin/modules/client-profiles/ClientProfileRowActions';
import TableEmptyStateRow from '@/components/shared/table/TableEmptyStateRow';
import TableSkeletonRows from '@/components/shared/table/TableSkeletonRows';
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
import { ENDPOINTS } from '@/config/api/endpoints';
import type { ClientProfile } from '@/domains/client-profiles/types/admin';
import { useTable } from '@/lib/table';
import { getInitials } from '@/lib/utils/string';

const LIST_ENDPOINT = ENDPOINTS.ADMIN.MODULES.CLIENT_PROFILES.LIST;

type ClientProfileColumnKey =
  | 'reference'
  | 'client'
  | 'contactPhone'
  | 'contactEmail'
  | 'dob'
  | 'gender'
  | 'actions';

type ClientProfileColumnDefinition = {
  key: ClientProfileColumnKey;
  label: string;
  headerClassName: string;
  skeletonWidth: string;
};

const CLIENT_PROFILE_VISIBLE_COLUMNS_STORAGE_KEY =
  'sakyi:admin:client-profiles:visible-columns:v3';

/** Defaults mirror common triage; staff can hide profile fields from Columns. */
const DEFAULT_VISIBLE_COLUMN_KEYS: readonly ClientProfileColumnKey[] = [
  'reference',
  'client',
  'contactPhone',
  'contactEmail',
  'dob',
  'gender',
  'actions',
];

const CLIENT_PROFILE_COLUMNS: readonly ClientProfileColumnDefinition[] = [
  {
    key: 'reference',
    label: 'Reference',
    headerClassName: '',
    skeletonWidth: 'w-28',
  },
  {
    key: 'client',
    label: 'Client',
    headerClassName: '',
    skeletonWidth: 'w-44',
  },
  {
    key: 'contactPhone',
    label: 'Contact phone',
    headerClassName: '',
    skeletonWidth: 'w-28',
  },
  {
    key: 'contactEmail',
    label: 'Contact email',
    headerClassName: '',
    skeletonWidth: 'w-40',
  },
  {
    key: 'dob',
    label: 'Date of birth',
    headerClassName: 'tabular-nums',
    skeletonWidth: 'w-28',
  },
  {
    key: 'gender',
    label: 'Gender',
    headerClassName: '',
    skeletonWidth: 'w-36',
  },
  {
    key: 'actions',
    label: 'Actions',
    headerClassName: 'text-end',
    skeletonWidth: 'w-32',
  },
] as const;

type GenderKind = 'male' | 'female' | 'other';

const GENDER_BADGE: Record<
  GenderKind,
  {
    icon: ComponentType<{ className?: string }>;
    label: string;
    className: string;
  }
> = {
  male: {
    icon: MarsIcon,
    label: 'Male',
    className:
      'border-sky-300/80 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200',
  },
  female: {
    icon: VenusIcon,
    label: 'Female',
    className:
      'border-fuchsia-300/80 bg-fuchsia-50 text-fuchsia-900 dark:border-fuchsia-800 dark:bg-fuchsia-950/40 dark:text-fuchsia-200',
  },
  other: {
    icon: CircleDotIcon,
    /** Hard-coded inclusive label for non-male/female values (e.g. non-binary, unspecified). */
    label: 'Other',
    className:
      'border-neutral-300/80 bg-neutral-50 text-neutral-800 dark:border-neutral-700 dark:bg-neutral-950/40 dark:text-neutral-200',
  },
};

function resolveGenderKind(
  raw: string | null | undefined,
): GenderKind | null {
  if (!raw?.trim()) return null;
  const compact = raw.trim().toLowerCase().replace(/[\s_-]+/g, '');
  if (
    compact === 'female' ||
    compact === 'f' ||
    compact === 'woman' ||
    compact.startsWith('female')
  ) {
    return 'female';
  }
  if (
    compact === 'male' ||
    compact === 'm' ||
    compact === 'man' ||
    compact.startsWith('male')
  ) {
    return 'male';
  }
  return 'other';
}

function formatDateCell(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  try {
    return format(parseISO(iso.trim()), 'dd-MMMM-yyyy');
  } catch {
    return iso.trim();
  }
}

function getClientProfileReference(row: ClientProfile): string {
  const code = row.client_code?.trim();
  if (code) return code;
  return `#${row.id}`;
}

function resolveProfilePictureUrl(
  raw: string | null | undefined,
): string | undefined {
  if (!raw?.trim()) return undefined;
  const t = raw.trim();
  if (t.startsWith('http')) return t;
  return `${base.domainEndpoint}${t}`;
}

export default function ClientProfileListTable() {
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<
    ClientProfileColumnKey[]
  >(() => {
    const fallback = [...DEFAULT_VISIBLE_COLUMN_KEYS];
    if (typeof window === 'undefined') return fallback;

    const raw = window.localStorage.getItem(
      CLIENT_PROFILE_VISIBLE_COLUMNS_STORAGE_KEY,
    );
    if (!raw) return fallback;

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return fallback;

      const allowed = new Set(CLIENT_PROFILE_COLUMNS.map((c) => c.key));
      const next = parsed.filter(
        (value): value is ClientProfileColumnKey =>
          typeof value === 'string' &&
          allowed.has(value as ClientProfileColumnKey),
      );

      return next.length > 0 ? next : fallback;
    } catch {
      return fallback;
    }
  });

  const { rows, controls } = useTable<ClientProfile>(LIST_ENDPOINT, {
    params: {
      sync: true,
      writeInitialToUrl: true,
    },
  });

  const { query } = controls;
  const showSkeleton = query.isPending && !query.data;
  const errorMessage =
    query.isError && query.error instanceof Error
      ? query.error.message
      : 'Could not load client profiles.';

  const visibleColumns = useMemo(
    () =>
      CLIENT_PROFILE_COLUMNS.filter((column) =>
        visibleColumnKeys.includes(column.key),
      ),
    [visibleColumnKeys],
  );
  const visibleColumnSet = useMemo(
    () => new Set(visibleColumnKeys),
    [visibleColumnKeys],
  );
  const visibleColumnCount = Math.max(1, visibleColumns.length);
  const visibleSkeletonWidths = useMemo(
    () => visibleColumns.map((column) => column.skeletonWidth),
    [visibleColumns],
  );

  useEffect(() => {
    window.localStorage.setItem(
      CLIENT_PROFILE_VISIBLE_COLUMNS_STORAGE_KEY,
      JSON.stringify(visibleColumnKeys),
    );
  }, [visibleColumnKeys]);

  const toggleColumn = (columnKey: string) => {
    setVisibleColumnKeys((current) => {
      const nextColumnKey = CLIENT_PROFILE_COLUMNS.find(
        (column) => column.key === columnKey,
      )?.key;
      if (!nextColumnKey) return current;

      if (current.includes(nextColumnKey)) {
        if (current.length === 1) return current;
        return current.filter((key) => key !== nextColumnKey);
      }

      return CLIENT_PROFILE_COLUMNS.map((column) => column.key).filter(
        (key) => key === nextColumnKey || current.includes(key),
      );
    });
  };

  const resetColumns = () => {
    setVisibleColumnKeys([...DEFAULT_VISIBLE_COLUMN_KEYS]);
  };

  const showColumn = (key: ClientProfileColumnKey) =>
    visibleColumnSet.has(key);

  return (
    <TableListShell
      controls={controls}
      searchPlaceholder='Search ...'
      filters={
        <ClientProfileFilters
          columns={CLIENT_PROFILE_COLUMNS}
          visibleColumnKeys={visibleColumnKeys}
          onToggleColumn={toggleColumn}
          onResetColumns={resetColumns}
        />
      }
    >
      <Table className='w-full min-w-6xl'>
        <TableHeader className='bg-muted/50 [&_tr]:border-border'>
          <TableRow className='border-border hover:bg-transparent'>
            {visibleColumns.map((column) => (
              <TableHead key={column.key} className={column.headerClassName}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {showSkeleton && (
            <TableSkeletonRows
              rowCount={3}
              columnCount={visibleColumnCount}
              cellWidths={visibleSkeletonWidths}
            />
          )}

          {!showSkeleton && query.isError && (
            <TableRow>
              <TableCell
                colSpan={visibleColumnCount}
                className='text-destructive py-8 text-center text-sm'
              >
                {errorMessage}
              </TableCell>
            </TableRow>
          )}

          {!showSkeleton &&
            !query.isError &&
            query.data?.status === 'success' &&
            rows.length === 0 && (
              <TableEmptyStateRow
                colSpan={visibleColumnCount}
                title='No Client Profiles Found'
                description='No client profiles found. It’s possible none exist yet, or your filters may be hiding results. Adjust your filters or check back later.'
              />
            )}

          {!showSkeleton &&
            !query.isError &&
            query.data?.status === 'success' &&
            rows.map((row) => {
              const pictureSrc = resolveProfilePictureUrl(
                row.profile?.picture_url,
              );
              const phone = row.profile?.contact_phone?.trim();
              const profileEmail = row.profile?.contact_email?.trim();
              const accountEmail = row.email?.trim();
              const contactEmailDisplay = profileEmail || accountEmail || '';
              const dobDisplay = formatDateCell(row.profile?.dob ?? null);
              const genderKind = resolveGenderKind(row.profile?.gender);

              return (
                <TableRow key={row.id}>
                  {showColumn('reference') ? (
                    <TableCell>
                      <p className='text-foreground text-[13px] font-semibold'>
                        {getClientProfileReference(row)}
                      </p>
                    </TableCell>
                  ) : null}
                  {showColumn('client') ? (
                    <TableCell>
                      <div className='flex items-start gap-3'>
                        <Avatar
                          size='default'
                          className='mt-0.5 shrink-0'
                          aria-hidden
                        >
                          {pictureSrc ? (
                            <AvatarImage src={pictureSrc} alt='' />
                          ) : null}
                          <AvatarFallback className='text-xs'>
                            {getInitials(row.name ?? '', 2) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className='min-w-0 flex-1 space-y-1'>
                          <p className='text-foreground text-[13px] font-semibold'>
                            {row.name?.trim() ? (
                              row.name.trim()
                            ) : (
                              <TableCellEmpty label='Name not provided' />
                            )}
                          </p>
                          <p className='text-muted-foreground text-xs leading-snug font-medium wrap-break-word'>
                            {row.email?.trim() ?? 'No email on file'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  ) : null}
                  {showColumn('contactPhone') ? (
                    <TableCell>
                      {phone ? (
                        <span className='text-[13px] font-medium'>{phone}</span>
                      ) : (
                        <TableCellEmpty label='Not provided' />
                      )}
                    </TableCell>
                  ) : null}
                  {showColumn('contactEmail') ? (
                    <TableCell>
                      {contactEmailDisplay ? (
                        <span className='text-[13px] font-medium wrap-break-word'>
                          {contactEmailDisplay}
                        </span>
                      ) : (
                        <TableCellEmpty label='No email on file' />
                      )}
                    </TableCell>
                  ) : null}
                  {showColumn('dob') ? (
                    <TableCell className='tabular-nums'>
                      {dobDisplay ?? (
                        <TableCellEmpty label='Not provided' />
                      )}
                    </TableCell>
                  ) : null}
                  {showColumn('gender') ? (
                    <TableCell>
                      {genderKind ? (
                        (() => {
                          const spec = GENDER_BADGE[genderKind];
                          const Icon = spec.icon;
                          return (
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${spec.className}`}
                            >
                              <Icon className='size-3.5 shrink-0' />
                              {spec.label}
                            </span>
                          );
                        })()
                      ) : (
                        <TableCellEmpty label='Not provided' />
                      )}
                    </TableCell>
                  ) : null}
                  {showColumn('actions') ? (
                    <TableCell className='align-center text-end whitespace-nowrap'>
                      <ClientProfileRowActions row={row} />
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </TableListShell>
  );
}
