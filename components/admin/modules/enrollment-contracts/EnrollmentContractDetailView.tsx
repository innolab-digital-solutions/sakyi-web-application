'use client';

import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { BanIcon, CheckCircle2Icon, FileSignatureIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { type ComponentType } from 'react';

import { AdminDetailCardSkeleton } from '@/components/admin/layout/AdminLoadingSkeletons';
import CreateEnrollmentFromContractModal from '@/components/admin/modules/enrollment-contracts/CreateEnrollmentFromContractModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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

const STATUS_LABEL: Record<EnrollmentContractStatus, string> = {
  assigned: 'Assigned',
  signed: 'Signed',
  voided: 'Voided',
};

const STATUS_STYLES: Record<
  EnrollmentContractStatus,
  {
    icon: ComponentType<{ className?: string }>;
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
  voided: {
    icon: BanIcon,
    className:
      'border-rose-300/80 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
  },
};

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
    return <AdminDetailCardSkeleton />;
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
  const statusStyle = STATUS_STYLES[data.status];
  const StatusIcon = statusStyle.icon;
  const sentAt = formatDateCell(data.timestamps.sent_at);
  const signedAt = formatDateCell(data.timestamps.signed_at);
  const createdAt = formatDateCell(data.timestamps.created_at);
  const updatedAt = formatDateCell(data.timestamps.updated_at);
  const signatureSrc = data.signature_url?.trim()
    ? (resolveMediaUrl(data.signature_url) ?? data.signature_url.trim())
    : null;

  const hasLinkedEnrollment = contractHasLinkedEnrollment(data);
  const linkedEnrollmentId = data.enrollment?.id;

  return (
    <div className='space-y-6'>
      <section className='border-border max-w-full min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-5'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <h2 className='text-foreground text-sm font-semibold'>Contract</h2>
            <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
              E-signature status, notification timing, and key dates for this
              enrollment contract.
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
              {getContractReference(data)}
            </dd>
          </div>
          <div>
            <dt className='text-muted-foreground text-xs font-semibold'>
              Terms accepted
            </dt>
            <dd className='text-foreground mt-0.5 text-[13px] font-medium'>
              {data.accepted_terms ? 'Yes' : 'No'}
            </dd>
          </div>
          <div>
            <dt className='text-muted-foreground text-xs font-semibold'>
              Notification sent
            </dt>
            <dd className='text-foreground mt-0.5 text-[13px] font-medium tabular-nums'>
              {sentAt ?? <TableCellEmpty label='Not sent yet' />}
            </dd>
          </div>
          <div>
            <dt className='text-muted-foreground text-xs font-semibold'>
              Signature recorded
            </dt>
            <dd className='text-foreground mt-0.5 text-[13px] font-medium tabular-nums'>
              {signedAt ?? <TableCellEmpty label='Not recorded' />}
            </dd>
          </div>
          <div>
            <dt className='text-muted-foreground text-xs font-semibold'>
              Created
            </dt>
            <dd className='text-foreground mt-0.5 text-[13px] font-medium tabular-nums'>
              {createdAt ?? <TableCellEmpty label='—' />}
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
        {data.signed_by_name?.trim() ? (
          <div className='border-border mt-5 border-t pt-5'>
            <p className='text-muted-foreground text-xs font-semibold'>
              Signed by (name on file)
            </p>
            <p className='text-foreground mt-1 text-[13px] font-semibold'>
              {data.signed_by_name.trim()}
            </p>
          </div>
        ) : null}
        {signatureSrc ? (
          <div className='border-border mt-5 border-t pt-5'>
            <p className='text-muted-foreground text-xs font-semibold'>
              Captured signature
            </p>
            <div className='mt-2'>
              <SignatureDetailPreview url={signatureSrc} />
            </div>
          </div>
        ) : null}
      </section>

      <section className='border-border max-w-full min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-5'>
        <h2 className='text-foreground text-sm font-semibold'>Applicant</h2>
        <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
          Client linked through the related intake assessment.
        </p>
        {client ? (
          <div className='mt-5 flex items-start gap-4'>
            <Avatar size='lg' className='size-14 shrink-0'>
              {clientPic ? <AvatarImage src={clientPic} alt='' /> : null}
              <AvatarFallback className='text-sm'>
                {getInitials(client.name ?? '', 2) || '?'}
              </AvatarFallback>
            </Avatar>
            <dl className='min-w-0 flex-1 space-y-2'>
              <div>
                <dt className='text-muted-foreground text-xs font-semibold'>
                  Name
                </dt>
                <dd className='text-foreground text-[13px] font-semibold'>
                  {client.name?.trim() || '—'}
                </dd>
              </div>
              <div>
                <dt className='text-muted-foreground text-xs font-semibold'>
                  Email
                </dt>
                <dd className='text-foreground text-[13px] font-medium wrap-break-word'>
                  {client.email?.trim() || '—'}
                </dd>
              </div>
              {client.id != null ? (
                <div className='pt-1'>
                  <Button variant='outline' size='sm' className='h-9' asChild>
                    <Link
                      href={ROUTES.ADMIN.MODULES.CLIENT_PROFILES.DETAIL(
                        String(client.id),
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
            No applicant linked to this contract.
          </p>
        )}
      </section>

      <section className='border-border max-w-full min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-5'>
        <h2 className='text-foreground text-sm font-semibold'>
          Linked records
        </h2>
        <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
          Intake and enrollment request associated with this contract.
        </p>
        <div className='mt-5 flex flex-wrap gap-2'>
          {intake?.id != null ? (
            <Button variant='outline' size='sm' className='h-9' asChild>
              <Link
                href={ROUTES.ADMIN.MODULES.INTAKE_ASSESSMENTS.DETAIL(
                  String(intake.id),
                )}
              >
                Intake: {intake.code?.trim() || `#${intake.id}`}
              </Link>
            </Button>
          ) : (
            <p className='text-muted-foreground text-sm'>No intake linked.</p>
          )}
          {intake?.enrollment_request?.id != null ? (
            <Button variant='outline' size='sm' className='h-9' asChild>
              <Link
                href={ROUTES.ADMIN.MODULES.ENROLLMENT_REQUESTS.DETAIL(
                  String(intake.enrollment_request.id),
                )}
              >
                Request:{' '}
                {intake.enrollment_request.code?.trim() ||
                  `#${intake.enrollment_request.id}`}
              </Link>
            </Button>
          ) : null}
        </div>
      </section>

      <section className='border-border max-w-full min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-5'>
        <h2 className='text-foreground text-sm font-semibold'>Next steps</h2>
        <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
          After the client signs, create or open the program enrollment record.
        </p>
        <div className='mt-5 flex flex-wrap gap-2'>
          {data.status === 'assigned' ? (
            <p className='text-muted-foreground text-sm'>
              Awaiting client signature on the mobile app.
            </p>
          ) : null}
          {data.status === 'signed' &&
          hasLinkedEnrollment &&
          linkedEnrollmentId != null ? (
            <Button className='h-9' asChild>
              <Link
                href={ROUTES.ADMIN.MODULES.ENROLLMENT_RECORDS.DETAIL(
                  String(linkedEnrollmentId),
                )}
              >
                View enrollment
              </Link>
            </Button>
          ) : null}
          {data.status === 'signed' && !hasLinkedEnrollment ? (
            <Button
              type='button'
              className='h-9'
              onClick={() => setCreateEnrollmentOpen(true)}
            >
              Create Enrollment
            </Button>
          ) : null}
        </div>
      </section>

      <CreateEnrollmentFromContractModal
        contractId={createEnrollmentOpen ? contractId : null}
        open={createEnrollmentOpen}
        onOpenChange={setCreateEnrollmentOpen}
      />
    </div>
  );
}

function SignatureDetailPreview({ url }: { url: string }) {
  return (
    <div className='bg-background border-border inline-flex max-w-full items-center justify-center rounded-md border px-3 py-2'>
      <Image
        src={url}
        alt='Recorded signature'
        width={280}
        height={72}
        className='h-14 w-auto max-w-full object-contain object-center'
        unoptimized={
          url.startsWith('http://') ||
          url.startsWith('https://') ||
          url.startsWith('blob:')
        }
      />
    </div>
  );
}
