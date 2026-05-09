'use client';

import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ChevronRightIcon, FileTextIcon, ImageOffIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { type ReactNode, useState } from 'react';

import CreateEnrollmentFromContractModal from '@/components/admin/modules/enrollment-contracts/CreateEnrollmentFromContractModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TableCellEmpty from '@/components/ui/table-cell-empty';
import { base } from '@/config/api/base';
import { ROUTES } from '@/config/routes';
import { getEnrollmentContractById } from '@/domains/enrollment-contracts/services';
import {
  contractHasLinkedEnrollment,
  type EnrollmentContract,
  type EnrollmentContractStatus,
} from '@/domains/enrollment-contracts/types';
import { getInitials } from '@/lib/utils/string';
import { cn } from '@/lib/utils/styles';

/** Primary white card shell — matches {@link EnrollmentRequestDetailView}. */
const CARD_SURFACE =
  'border-border max-w-full min-w-0 rounded-md border bg-white p-6 shadow-xs';

/** Matches admin back / secondary actions (`enrollment-requests/[id]/page`). */
const ADMIN_OUTLINE_BUTTON_CLASS =
  'normal-case bg-background hover:bg-muted h-10 shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold';

/** Matches primary list CTAs and pipeline primary actions. */
const ADMIN_PRIMARY_BUTTON_CLASS =
  'normal-case h-10 shrink-0 gap-1.5 rounded-md px-3 text-[13px]! font-semibold';

/** Shared muted tile shell — overview KPI grid. */
const METRIC_TILE_CLASS =
  'bg-muted/50 border-border flex min-h-18 flex-col justify-center rounded-md border px-2.5 py-2';

const METRIC_TILE_LABEL_CLASS =
  'text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wide uppercase';

const OVERVIEW_EMPTY_DASH = (
  <span className='text-muted-foreground font-semibold'>-</span>
);

const STATUS_LABEL: Record<EnrollmentContractStatus, string> = {
  assigned: 'Assigned',
  signed: 'Signed',
  voided: 'Voided',
};

function EnrollmentContractDetailSkeleton() {
  return (
    <div className='grid gap-3 lg:grid-cols-3 lg:gap-4'>
      <section className={`${CARD_SURFACE} space-y-5 lg:col-span-2`}>
        <header className='border-border shrink-0 border-b pb-5'>
          <Skeleton className='h-5 w-36 rounded-sm' />
          <Skeleton className='mt-2 h-3 max-w-3xl rounded-sm' />
          <Skeleton className='mt-2 h-3 max-w-2xl rounded-sm' />
        </header>
        <div className='space-y-3'>
          <div className='grid gap-1.5 md:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`contract-metric-sk-${idx}`}
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
            <Skeleton className='h-5 w-56 rounded-sm' />
            <Skeleton className='mt-2 h-3 max-w-md rounded-sm' />
            <Skeleton className='mt-1 h-3 max-w-lg rounded-sm' />
          </header>
          <div className='flex flex-col gap-2 pt-5'>
            <Skeleton className='h-10 w-full rounded-md' />
            <Skeleton className='h-10 w-full rounded-md' />
          </div>
          <div className='border-border border-t pt-4'>
            <Skeleton className='h-10 w-full rounded-md' />
          </div>
        </section>
      </div>
    </div>
  );
}

function ContractMetricTile({
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

function resolveMediaUrl(raw: string | null | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  const t = raw.trim();
  if (t.startsWith('http')) return t;
  return `${base.domainEndpoint}${t}`;
}

function getContractReference(contract: EnrollmentContract): string {
  const code = contract.code?.trim();
  if (code) return code;
  return `#${contract.id}`;
}

export type EnrollmentContractDetailViewProps = {
  contractId: number;
};

export default function EnrollmentContractDetailView({
  contractId,
}: EnrollmentContractDetailViewProps) {
  const [createEnrollmentOpen, setCreateEnrollmentOpen] = useState(false);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['enrollment-contract', contractId],
    queryFn: async () => {
      const res = await getEnrollmentContractById(contractId);
      if (res.status === 'error') {
        throw new Error(res.message || 'Could not load enrollment contract.');
      }
      return res.data;
    },
  });

  if (isPending) {
    return <EnrollmentContractDetailSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className='border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-6 text-sm'>
        {error instanceof Error ? error.message : 'Could not load contract.'}
      </div>
    );
  }

  const intake = data.onboarding_intake;
  const client = intake?.client;
  const clientPic = resolveMediaUrl(client?.picture_url);
  const sentAt = formatDateCell(data.timestamps.sent_at);
  const signedAt = formatDateCell(data.timestamps.signed_at);
  const updatedAt = formatDateCell(data.timestamps.updated_at);
  const signatureSrc = data.signature_url?.trim()
    ? (resolveMediaUrl(data.signature_url) ?? data.signature_url.trim())
    : null;

  const hasLinkedEnrollment = contractHasLinkedEnrollment(data);
  const linkedEnrollmentId = data.enrollment?.id;
  const showProgramEnrollmentActions =
    data.status === 'assigned' ||
    (data.status === 'signed' &&
      hasLinkedEnrollment &&
      linkedEnrollmentId != null) ||
    (data.status === 'signed' && !hasLinkedEnrollment);

  return (
    <div className='grid gap-3 lg:grid-cols-3 lg:gap-4'>
      <section className={`${CARD_SURFACE} space-y-5 lg:col-span-2`}>
        <header className='border-border shrink-0 border-b pb-5'>
          <h3 className='text-foreground text-sm font-semibold'>Overview</h3>
          <p className='text-muted-foreground mt-1 max-w-3xl text-[13px] leading-relaxed font-medium'>
            Reference, contract status, terms acceptance, notification and
            signature dates, last updated time, and the captured signature image
            for this enrollment contract.
          </p>
        </header>

        <div className='space-y-3'>
          <div className='grid gap-1.5 md:grid-cols-3'>
            <ContractMetricTile
              label='Contract reference'
              value={getContractReference(data)}
              tabularNums={false}
            />
            <ContractMetricTile
              label='Contract status'
              value={STATUS_LABEL[data.status]}
              tabularNums={false}
            />
            <ContractMetricTile
              label='Terms accepted'
              value={data.accepted_terms ? 'Yes' : 'No'}
              tabularNums={false}
            />
            <ContractMetricTile
              label='Notification sent'
              value={sentAt ?? <TableCellEmpty label='Not sent yet' />}
            />
            <ContractMetricTile
              label='Signature recorded'
              value={signedAt ?? <TableCellEmpty label='Not recorded' />}
            />
            <ContractMetricTile
              label='Last updated'
              value={updatedAt ?? OVERVIEW_EMPTY_DASH}
            />
          </div>

          {data.signed_by_name?.trim() || signatureSrc ? (
            <div className='border-border space-y-4 border-t pt-5'>
              {data.signed_by_name?.trim() ? (
                <div>
                  <p className={METRIC_TILE_LABEL_CLASS}>
                    Signed by (name on file)
                  </p>
                  <p className='text-foreground/90 mt-1.5 text-[12.5px] font-semibold'>
                    {data.signed_by_name.trim()}
                  </p>
                </div>
              ) : null}
              {signatureSrc ? (
                <div>
                  <p className={METRIC_TILE_LABEL_CLASS}>Captured signature</p>
                  <div className='mt-2'>
                    <SignatureDetailPreview
                      key={signatureSrc}
                      url={signatureSrc}
                    />
                  </div>
                </div>
              ) : null}
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
              Person linked through the related intake assessment. Confirm
              identity here before reviewing this contract.
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
              No applicant account linked to this contract.
            </p>
          )}
        </section>

        <section className={`${CARD_SURFACE} flex min-h-0 flex-col`}>
          <header className='border-border shrink-0 border-b pb-4'>
            <h3 className='text-foreground text-sm font-semibold'>
              Related Workflow &amp; Enrollment
            </h3>
            <p className='text-muted-foreground mt-1 max-w-3xl text-[13px] leading-relaxed font-medium'>
              Open the intake and enrollment request for full context, then
              create or open the program enrollment record after the client
              signs.
            </p>
          </header>
          <div className='flex flex-col gap-4 pt-5'>
            <div className='flex flex-col gap-2'>
              {intake?.id != null ? (
                <Button
                  variant='outline'
                  className={`${ADMIN_OUTLINE_BUTTON_CLASS} w-full justify-center`}
                  asChild
                >
                  <Link
                    href={ROUTES.ADMIN.MODULES.INTAKE_ASSESSMENTS.DETAIL(
                      String(intake.id),
                    )}
                  >
                    <FileTextIcon className='size-3.5' />
                    Intake: {intake.code?.trim() || `#${intake.id}`}
                    <ChevronRightIcon className='size-3.5 opacity-70' />
                  </Link>
                </Button>
              ) : (
                <p className='text-muted-foreground text-sm'>
                  No intake linked.
                </p>
              )}
              {intake?.enrollment_request?.id != null ? (
                <Button
                  variant='outline'
                  className={`${ADMIN_OUTLINE_BUTTON_CLASS} w-full justify-center`}
                  asChild
                >
                  <Link
                    href={ROUTES.ADMIN.MODULES.ENROLLMENT_REQUESTS.DETAIL(
                      String(intake.enrollment_request.id),
                    )}
                  >
                    <FileTextIcon className='size-3.5' />
                    Request:{' '}
                    {intake.enrollment_request.code?.trim() ||
                      `#${intake.enrollment_request.id}`}
                    <ChevronRightIcon className='size-3.5 opacity-70' />
                  </Link>
                </Button>
              ) : null}
            </div>
            {showProgramEnrollmentActions ? (
              <div className='border-border flex flex-col gap-3 border-t pt-4'>
                {data.status === 'assigned' ? (
                  <p className='text-muted-foreground text-[12.5px] leading-relaxed font-medium'>
                    Awaiting client signature on the mobile app.
                  </p>
                ) : null}
                {data.status === 'signed' &&
                hasLinkedEnrollment &&
                linkedEnrollmentId != null ? (
                  <Button className={ADMIN_PRIMARY_BUTTON_CLASS} asChild>
                    <Link
                      href={ROUTES.ADMIN.MODULES.ENROLLMENT_RECORDS.DETAIL(
                        String(linkedEnrollmentId),
                      )}
                    >
                      <FileTextIcon className='size-3.5' />
                      Open Enrollment
                      <ChevronRightIcon className='size-3.5' />
                    </Link>
                  </Button>
                ) : null}
                {data.status === 'signed' && !hasLinkedEnrollment ? (
                  <Button
                    type='button'
                    className={ADMIN_PRIMARY_BUTTON_CLASS}
                    onClick={() => setCreateEnrollmentOpen(true)}
                  >
                    Create Enrollment
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <CreateEnrollmentFromContractModal
        contractId={createEnrollmentOpen ? contractId : null}
        open={createEnrollmentOpen}
        onOpenChange={setCreateEnrollmentOpen}
      />
    </div>
  );
}

function SignatureDetailPreview({ url }: { url: string }) {
  const [loadFailed, setLoadFailed] = useState(false);

  const unoptimized =
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:');

  if (loadFailed) {
    return (
      <div
        role='status'
        className='bg-muted/35 border-border flex max-w-md flex-col rounded-md border border-dashed px-3 py-3'
      >
        <div className='text-muted-foreground flex items-start gap-2'>
          <ImageOffIcon
            className='text-muted-foreground mt-0.5 size-4 shrink-0'
            aria-hidden
          />
          <div className='min-w-0 space-y-1'>
            <p className='text-foreground/90 text-[12.5px] leading-snug font-semibold'>
              Signature preview unavailable
            </p>
            <p className='text-[12px] leading-relaxed font-medium'>
              The image could not be loaded. It may be missing, moved, or
              blocked by storage rules.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-background border-border inline-flex max-w-full items-center justify-center rounded-md border px-3 py-2'>
      <Image
        src={url}
        alt='Recorded signature'
        width={280}
        height={72}
        className='h-14 w-auto max-w-full object-contain object-center'
        unoptimized={unoptimized}
        onError={() => setLoadFailed(true)}
      />
    </div>
  );
}
