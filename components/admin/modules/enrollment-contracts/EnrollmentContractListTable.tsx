'use client';

import { format, parseISO } from 'date-fns';
import { CheckCircle2Icon, FileSignatureIcon } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import TableListShell from '@/components/admin/layout/TableListShell';
import EnrollmentContractFilters from '@/components/admin/modules/enrollment-contracts/EnrollmentContractFilters';
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
import { ENDPOINTS } from '@/config/api/endpoints';
import type {
  EnrollmentContract,
  EnrollmentContractStatus,
} from '@/domains/enrollment-contracts/types';
import { useTable } from '@/lib/table';
import { getInitials } from '@/lib/utils/string';

const STATUS_LABEL: Record<EnrollmentContractStatus, string> = {
  assigned: 'Assigned',
  signed: 'Signed',
};

const CONTRACT_STATUSES: readonly EnrollmentContractStatus[] = [
  'assigned',
  'signed',
];

type ContractColumnKey =
  | 'reference'
  | 'applicant'
  | 'intake'
  | 'enrollmentRequest'
  | 'signer'
  | 'signature'
  | 'sentAt'
  | 'signedAt'
  | 'status';

type ContractColumnDefinition = {
  key: ContractColumnKey;
  label: string;
  headerClassName: string;
  skeletonWidth: string;
};

const CONTRACT_VISIBLE_COLUMNS_STORAGE_KEY =
  'sakyi:admin:enrollment-contracts:visible-columns';

const CONTRACT_COLUMNS: readonly ContractColumnDefinition[] = [
  {
    key: 'reference',
    label: 'Reference',
    headerClassName: 'min-w-40',
    skeletonWidth: 'w-28',
  },
  {
    key: 'applicant',
    label: 'Applicant',
    headerClassName: 'min-w-48',
    skeletonWidth: 'w-40',
  },
  {
    key: 'intake',
    label: 'Intake reference',
    headerClassName: 'min-w-40',
    skeletonWidth: 'w-30',
  },
  {
    key: 'enrollmentRequest',
    label: 'Linked Request',
    headerClassName: 'min-w-44',
    skeletonWidth: 'w-32',
  },
  {
    key: 'signer',
    label: 'Signed By',
    headerClassName: 'min-w-44',
    skeletonWidth: 'w-36',
  },
  {
    key: 'signature',
    label: 'Captured signature',
    headerClassName: 'min-w-56',
    skeletonWidth: 'w-44',
  },
  {
    key: 'sentAt',
    label: 'Notification sent',
    headerClassName: 'min-w-40',
    skeletonWidth: 'w-30',
  },
  {
    key: 'signedAt',
    label: 'Signature recorded',
    headerClassName: 'min-w-40',
    skeletonWidth: 'w-30',
  },
  {
    key: 'status',
    label: 'Status',
    headerClassName: 'min-w-32',
    skeletonWidth: 'w-28',
  },
] as const;

const STATUS_STYLES: Record<
  EnrollmentContractStatus,
  {
    icon: React.ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  assigned: {
    icon: FileSignatureIcon,
    className:
      'border-sky-300/80 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200',
  },
  signed: {
    icon: CheckCircle2Icon,
    className:
      'border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  },
};

function formatDateCell(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return format(parseISO(iso), 'dd-MMMM-yyyy');
  } catch {
    return iso;
  }
}

function SignaturePreview({ url }: { url: string }) {
  const trimmed = url.trim();

  return (
    <div className='bg-background border-border inline-flex max-w-56 items-center justify-center rounded-md border px-2 py-1.5'>
      <Image
        src={trimmed}
        alt='Recorded signature'
        width={220}
        height={56}
        className='h-11 w-auto max-w-54 object-contain object-center'
        unoptimized
      />
    </div>
  );
}

export default function EnrollmentContractListTable() {
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<
    ContractColumnKey[]
  >(() => {
    const fallback = CONTRACT_COLUMNS.map((column) => column.key);
    if (typeof window === 'undefined') return fallback;

    const raw = window.localStorage.getItem(
      CONTRACT_VISIBLE_COLUMNS_STORAGE_KEY,
    );
    if (!raw) return fallback;

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return fallback;

      const allowed = new Set(CONTRACT_COLUMNS.map((column) => column.key));
      const next = parsed.filter(
        (value): value is ContractColumnKey =>
          typeof value === 'string' && allowed.has(value as ContractColumnKey),
      );

      return next.length > 0 ? next : fallback;
    } catch {
      return fallback;
    }
  });

  const { rows, controls } = useTable<EnrollmentContract>(
    ENDPOINTS.ADMIN.MODULES.ENROLLMENT_CONTRACTS.LIST,
    {
      params: {
        sync: true,
        writeInitialToUrl: true,
      },
    },
  );

  const statusFilter = useMemo(() => {
    const value = controls.params.values.status;
    if (value === 'assigned') return 'assigned';
    if (value === 'signed') return 'signed';
    return 'all';
  }, [controls.params.values.status]);

  const visibleColumns = useMemo(
    () =>
      CONTRACT_COLUMNS.filter((column) =>
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

  const { query } = controls;
  const showSkeleton = query.isPending && !query.data;
  const errorMessage =
    query.isError && query.error instanceof Error
      ? query.error.message
      : 'Could not load enrollment contracts.';

  useEffect(() => {
    window.localStorage.setItem(
      CONTRACT_VISIBLE_COLUMNS_STORAGE_KEY,
      JSON.stringify(visibleColumnKeys),
    );
  }, [visibleColumnKeys]);

  const toggleColumn = (columnKey: string) => {
    setVisibleColumnKeys((current) => {
      const nextColumnKey = CONTRACT_COLUMNS.find(
        (column) => column.key === columnKey,
      )?.key;
      if (!nextColumnKey) return current;

      if (current.includes(nextColumnKey)) {
        if (current.length === 1) return current;
        return current.filter((key) => key !== nextColumnKey);
      }

      return CONTRACT_COLUMNS.map((column) => column.key).filter(
        (key) => key === nextColumnKey || current.includes(key),
      );
    });
  };

  const resetColumns = () => {
    setVisibleColumnKeys(CONTRACT_COLUMNS.map((column) => column.key));
  };

  return (
    <TableListShell
      controls={controls}
      searchPlaceholder='Search applicant, contact, or reference'
      filters={
        <EnrollmentContractFilters
          statusFilter={statusFilter}
          statuses={CONTRACT_STATUSES}
          labels={STATUS_LABEL}
          onClearStatus={() => controls.params.clear(['status'])}
          onSetStatus={(status) => controls.params.set({ status })}
          columns={CONTRACT_COLUMNS}
          visibleColumnKeys={visibleColumnKeys}
          onToggleColumn={toggleColumn}
          onResetColumns={resetColumns}
        />
      }
    >
      <Table className='w-full min-w-7xl'>
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
                icon={FileSignatureIcon}
                title='No Enrollment Contracts Available'
                description='Enrollment contracts issued after intake completion will appear here for notification timing, captured signatures, and status tracking alongside linked intakes and enrollment requests.'
              />
            )}

          {!showSkeleton &&
            !query.isError &&
            query.data?.status === 'success' &&
            rows.map((contract) => {
              const intake = contract.onboarding_intake;
              const client = intake?.client;
              const sentAt = formatDateCell(contract.timestamps.sent_at);
              const signedAt = formatDateCell(contract.timestamps.signed_at);
              const statusStyle = STATUS_STYLES[contract.status];
              const StatusIcon = statusStyle.icon;
              const showColumn = (columnKey: ContractColumnKey) =>
                visibleColumnSet.has(columnKey);

              return (
                <TableRow key={contract.id}>
                  {showColumn('reference') ? (
                    <TableCell className='align-center min-w-45 whitespace-normal'>
                      <p className='text-foreground text-[13px] font-semibold'>
                        {contract.code?.trim() ? (
                          contract.code.trim()
                        ) : (
                          <TableCellEmpty label='No reference on file' />
                        )}
                      </p>
                    </TableCell>
                  ) : null}

                  {showColumn('applicant') ? (
                    <TableCell className='align-center whitespace-normal'>
                      {client ? (
                        <div className='flex items-start gap-3'>
                          <Avatar
                            size='default'
                            className='mt-0.5 shrink-0'
                            aria-hidden
                          >
                            {client.picture_url?.trim() ? (
                              <AvatarImage src={client.picture_url} alt='' />
                            ) : null}
                            <AvatarFallback className='text-xs'>
                              {getInitials(client.name ?? '', 2) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className='min-w-0 flex-1 space-y-1'>
                            <p className='text-foreground text-[13px] font-semibold'>
                              {client.name?.trim() ? (
                                client.name.trim()
                              ) : (
                                <TableCellEmpty label='Name not provided' />
                              )}
                            </p>
                            <p className='text-muted-foreground text-xs leading-snug font-medium wrap-break-word'>
                              {client.email?.trim()
                                ? client.email.trim()
                                : 'No email on file'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <TableCellEmpty label='No applicant linked' />
                      )}
                    </TableCell>
                  ) : null}

                  {showColumn('intake') ? (
                    <TableCell className='align-center min-w-45 whitespace-normal'>
                      <p className='text-foreground text-[13px] font-semibold'>
                        {intake?.code?.trim() ? (
                          intake.code.trim()
                        ) : (
                          <TableCellEmpty label='Not linked' />
                        )}
                      </p>
                    </TableCell>
                  ) : null}

                  {showColumn('enrollmentRequest') ? (
                    <TableCell className='align-center min-w-45 whitespace-normal'>
                      <p className='text-foreground text-[13px] font-semibold'>
                        {intake?.enrollment_request?.code?.trim() ? (
                          intake.enrollment_request.code.trim()
                        ) : (
                          <TableCellEmpty label='Not linked' />
                        )}
                      </p>
                    </TableCell>
                  ) : null}

                  {showColumn('signer') ? (
                    <TableCell className='align-center whitespace-normal'>
                      <p className='text-foreground text-[13px] font-semibold'>
                        {contract.signed_by_name?.trim() ? (
                          contract.signed_by_name.trim()
                        ) : (
                          <TableCellEmpty label='Awaiting signature' />
                        )}
                      </p>
                    </TableCell>
                  ) : null}

                  {showColumn('signature') ? (
                    <TableCell className='align-center whitespace-normal'>
                      {contract.signature_url?.trim() ? (
                        <SignaturePreview url={contract.signature_url} />
                      ) : (
                        <TableCellEmpty label='No signature on file' />
                      )}
                    </TableCell>
                  ) : null}

                  {showColumn('sentAt') ? (
                    <TableCell className='text-foreground/80 align-center tabular-nums'>
                      {sentAt ?? <TableCellEmpty label='Not sent yet' />}
                    </TableCell>
                  ) : null}

                  {showColumn('signedAt') ? (
                    <TableCell className='text-foreground/80 align-center tabular-nums'>
                      {signedAt ?? <TableCellEmpty label='Not recorded' />}
                    </TableCell>
                  ) : null}

                  {showColumn('status') ? (
                    <TableCell className='align-center'>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${statusStyle.className}`}
                      >
                        <StatusIcon className='size-3.5 shrink-0' />
                        {STATUS_LABEL[contract.status]}
                      </span>
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
