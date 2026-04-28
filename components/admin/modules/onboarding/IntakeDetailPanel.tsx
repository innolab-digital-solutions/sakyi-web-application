'use client';

import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  CheckCircle2Icon,
  FileTextIcon,
  PencilIcon,
  TimerResetIcon,
  XCircleIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { AdminWorkspaceSkeleton } from '@/components/admin/layout/AdminLoadingSkeletons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/config/routes';
import { getOnboardingIntakeById } from '@/domains/intake-assessments/services';
import type {
  OnboardingIntakeQuestion,
  OnboardingIntakeSection,
} from '@/domains/intake-assessments/types';
import { getInitials } from '@/lib/utils/string';

type IntakeDetailPanelProps = {
  intakeId: number;
};

function formatDate(iso: string | null): string {
  if (!iso) return 'Not set';
  try {
    return format(parseISO(iso), 'dd-MMMM-yyyy hh:mm a');
  } catch {
    return iso;
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

const PROGRAM_THUMBNAIL_FALLBACK = '/images/logo-gray.png';
const FILE_PREVIEW_FALLBACK = '/images/logo-gray.png';

type IntakeStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled';

const INTAKE_STATUS_LABEL: Record<IntakeStatus, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

/** Matches {@link IntakeListTable} status column badges. */
const INTAKE_STATUS_STYLES: Record<
  IntakeStatus,
  {
    icon: React.ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  draft: {
    icon: FileTextIcon,
    className:
      'border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  },
  in_progress: {
    icon: TimerResetIcon,
    className:
      'border-indigo-300/80 bg-indigo-50 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200',
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

function asIntakeStatus(value: string | undefined): IntakeStatus | null {
  if (value === 'draft') return 'draft';
  if (value === 'in_progress') return 'in_progress';
  if (value === 'completed') return 'completed';
  if (value === 'cancelled') return 'cancelled';
  return null;
}

function getReadableAnswer(question: OnboardingIntakeQuestion): string {
  const answer = question.answer;
  if (!answer || typeof answer !== 'object') return '-';

  const answerRecord = answer as Record<string, unknown>;

  if (question.type === 'multiselect') {
    const rawValues = Array.isArray(answerRecord.values)
      ? answerRecord.values
      : Array.isArray(answerRecord.value)
        ? answerRecord.value
        : [];
    const values = rawValues.filter(
      (value): value is string | number =>
        typeof value === 'string' || typeof value === 'number',
    );
    const prettyValues = values.map((value) =>
      String(value)
        .replace(/[_-]+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
        )
        .join(' '),
    );
    return prettyValues.length ? prettyValues.join(', ') : '-';
  }

  if (question.type === 'file') {
    const valueRecord =
      typeof answerRecord.value === 'object' && answerRecord.value !== null
        ? (answerRecord.value as Record<string, unknown>)
        : answerRecord;
    const fileLabel =
      (typeof valueRecord.original_name === 'string' &&
        valueRecord.original_name.trim()) ||
      (typeof valueRecord.filename === 'string' &&
        valueRecord.filename.trim()) ||
      (typeof valueRecord.name === 'string' && valueRecord.name.trim()) ||
      (typeof valueRecord.url === 'string' && valueRecord.url.trim()) ||
      (typeof valueRecord.path === 'string' && valueRecord.path.trim());
    return fileLabel || '-';
  }

  const value = answerRecord.value;
  if (typeof value === 'string') return value.trim() || '-';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';

  return '-';
}

function getFileAnswerMeta(question: OnboardingIntakeQuestion): {
  url: string | null;
  label: string;
} {
  const answer = question.answer;
  if (!answer || typeof answer !== 'object') {
    return { url: null, label: '-' };
  }
  const answerRecord = answer as Record<string, unknown>;
  const valueRecord =
    typeof answerRecord.value === 'object' && answerRecord.value !== null
      ? (answerRecord.value as Record<string, unknown>)
      : answerRecord;

  const url =
    (typeof valueRecord.url === 'string' && valueRecord.url.trim()) || null;
  const label =
    (typeof valueRecord.name === 'string' && valueRecord.name.trim()) ||
    (typeof valueRecord.original_name === 'string' &&
      valueRecord.original_name.trim()) ||
    (typeof valueRecord.filename === 'string' && valueRecord.filename.trim()) ||
    (typeof valueRecord.path === 'string' && valueRecord.path.trim()) ||
    '-';

  return { url, label };
}

function FileAnswerPreview({
  question,
}: {
  question: OnboardingIntakeQuestion;
}) {
  const { url, label } = getFileAnswerMeta(question);
  const [useFallback, setUseFallback] = useState(() => !url);
  const imageSrc = !useFallback && url ? url : FILE_PREVIEW_FALLBACK;

  return (
    <div className='border-border/70 bg-muted/10 space-y-3 rounded-md border p-3'>
      <p className='text-foreground/90 text-[13px] font-semibold'>
        {question.question}
      </p>
      <Avatar className='border-border/70 h-56 w-full rounded-md border'>
        {!useFallback && url ? (
          <AvatarImage
            src={imageSrc}
            alt={question.question}
            className='h-full w-full rounded-md object-cover'
            onError={() => setUseFallback(true)}
          />
        ) : null}
        <AvatarFallback className='bg-muted h-full w-full rounded-md'>
          <Image
            src={FILE_PREVIEW_FALLBACK}
            alt='File placeholder'
            width={88}
            height={88}
            className='h-20 w-20 object-contain opacity-70'
          />
        </AvatarFallback>
      </Avatar>
      <p className='text-muted-foreground text-xs leading-relaxed font-medium wrap-break-word'>
        {label}
      </p>
    </div>
  );
}

function ProgramThumbnail({
  thumbnailUrl,
  title,
}: {
  thumbnailUrl: string | null | undefined;
  title: string;
}) {
  const [useFallback, setUseFallback] = useState(() => !thumbnailUrl?.trim());
  const src = useFallback ? PROGRAM_THUMBNAIL_FALLBACK : thumbnailUrl!.trim();
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

function PersonAvatar({
  name,
  pictureUrl,
}: {
  name: string | null | undefined;
  pictureUrl: string | null | undefined;
}) {
  const [useFallback, setUseFallback] = useState(() => !pictureUrl?.trim());
  return (
    <Avatar size='default' className='mt-0.5 shrink-0' aria-hidden>
      {!useFallback && pictureUrl?.trim() ? (
        <AvatarImage
          src={pictureUrl.trim()}
          alt=''
          onError={() => setUseFallback(true)}
        />
      ) : null}
      <AvatarFallback className='text-xs'>
        {getInitials(name ?? '', 2) || '?'}
      </AvatarFallback>
    </Avatar>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className='space-y-1.5'>
      <p className='text-muted-foreground text-[10px]! font-semibold tracking-wide uppercase'>
        {label}
      </p>
      <div className='text-foreground/90 text-[13px] leading-relaxed font-semibold'>
        {value}
      </div>
    </div>
  );
}

export default function IntakeDetailPanel({
  intakeId,
}: IntakeDetailPanelProps) {
  const intakeQuery = useQuery({
    queryKey: ['onboarding', 'intake', intakeId],
    queryFn: () => getOnboardingIntakeById(intakeId),
  });

  if (intakeQuery.isPending) {
    return <AdminWorkspaceSkeleton />;
  }

  if (intakeQuery.data?.status === 'error') {
    return (
      <p className='text-destructive text-sm'>{intakeQuery.data.message}</p>
    );
  }

  const intake = intakeQuery.data?.data;
  if (!intake) return null;

  const isEditable =
    intake.status === 'draft' || intake.status === 'in_progress';
  const intakeLabel = intake.code?.trim() || `Intake #${intake.id}`;
  const programTitle =
    intake.program?.title?.trim() || intake.program?.slug?.trim() || 'Program';
  const handlerRole = intake.handler?.role?.trim()
    ? formatRoleLabel(intake.handler.role)
    : 'No role assigned';
  const templateLabel = `${intake.template?.title || 'Unknown template'} (v${
    intake.template?.version ?? '—'
  })`;
  const intakeSections = [...(intake.template?.sections ?? [])].sort(
    (left: OnboardingIntakeSection, right: OnboardingIntakeSection) =>
      left.sort_order - right.sort_order,
  );

  const intakeStatus = asIntakeStatus(intake.status);
  const statusStyle = intakeStatus
    ? INTAKE_STATUS_STYLES[intakeStatus]
    : INTAKE_STATUS_STYLES.draft;
  const StatusIcon = statusStyle.icon;

  return (
    <div className='grid gap-4 lg:grid-cols-3'>
      <section className='border-border max-w-full min-w-0 space-y-5 rounded-md border bg-white p-4 shadow-xs sm:p-5 lg:col-span-2 lg:p-6'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div className='space-y-1.5'>
            <p className='text-muted-foreground text-[10px]! font-semibold tracking-wide uppercase'>
              Intake Template
            </p>
            <h3 className='text-sm font-semibold tracking-normal'>
              {templateLabel}
            </h3>
          </div>

          <div className='flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end'>
            {isEditable ? (
              <Button
                className='h-10 w-full gap-1.5 rounded-md px-3 text-[13px]! font-semibold sm:w-auto'
                asChild
              >
                <Link
                  href={ROUTES.ADMIN.MODULES.INTAKE_ASSESSMENTS.INTERVIEW(
                    String(intake.id),
                  )}
                >
                  <PencilIcon className='size-3.5' />
                  Continue Interview
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        <div className='border-border border-t pt-5'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-4'>
              <DetailItem label='Assessment Reference' value={intakeLabel} />
              <DetailItem
                label='Linked Request Reference'
                value={intake.enrollment_request?.code?.trim() || 'Not linked'}
              />
              <DetailItem
                label='Requested Program Reference'
                value={intake.program?.code?.trim() || '-'}
              />
              <DetailItem
                label='Applicant (Client Code)'
                value={intake.client?.client_code?.trim() || '-'}
              />
            </div>
            <div className='space-y-4 text-left md:justify-self-end md:text-right'>
              <div className='space-y-1.5'>
                <p className='text-muted-foreground text-[10px]! font-semibold tracking-wide uppercase'>
                  Assessment Status
                </p>
                <div className='md:flex md:justify-end'>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${statusStyle.className}`}
                  >
                    <StatusIcon className='size-3.5 shrink-0' aria-hidden />
                    {intakeStatus
                      ? INTAKE_STATUS_LABEL[intakeStatus]
                      : intake.status}
                  </span>
                </div>
              </div>
              <DetailItem
                label='Created At'
                value={formatDate(intake.timestamps.created_at)}
              />
              <DetailItem
                label='Last Updated At'
                value={formatDate(intake.timestamps.updated_at)}
              />
              <DetailItem
                label='Cancellation Notes'
                value={intake.cancellation_note?.trim() || '-'}
              />
            </div>
          </div>
        </div>
      </section>

      <section className='border-border max-w-full min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-5 lg:p-6'>
        <div className='divide-border grid gap-5 divide-y'>
          <div className='space-y-2.5 pb-5'>
            <h3 className='text-muted-foreground text-[10px]! font-semibold tracking-wide uppercase'>
              Applicant
            </h3>
            <div className='flex items-start gap-3'>
              <PersonAvatar
                name={intake.client?.name}
                pictureUrl={intake.client?.picture_url}
              />
              <div className='min-w-0 flex-1 space-y-1'>
                <p className='text-foreground/90 text-[13px] font-semibold'>
                  {intake.client?.name?.trim() || 'No applicant name'}
                </p>
                <p className='text-muted-foreground text-xs leading-snug font-medium wrap-break-word'>
                  {intake.client?.email?.trim() || 'No email on file'}
                </p>
              </div>
            </div>
          </div>

          <div className='space-y-2.5 pb-5'>
            <h3 className='text-muted-foreground text-[10px]! font-semibold tracking-wide uppercase'>
              Handled By
            </h3>
            {intake.handler ? (
              <div className='flex items-start gap-3'>
                <PersonAvatar
                  name={intake.handler.name}
                  pictureUrl={intake.handler.picture_url}
                />
                <div className='min-w-0 flex-1 space-y-1'>
                  <p className='text-foreground/90 text-[13px] font-semibold'>
                    {intake.handler.name}
                  </p>
                  <p className='text-muted-foreground text-xs leading-snug font-medium wrap-break-word'>
                    {handlerRole}
                  </p>
                </div>
              </div>
            ) : (
              <p className='text-muted-foreground text-sm'>
                No handler has been assigned yet.
              </p>
            )}
          </div>

          <div className='space-y-2.5'>
            <h3 className='text-muted-foreground text-[10px]! font-semibold tracking-wide uppercase'>
              Requested Program
            </h3>
            <div className='flex items-start gap-3'>
              <ProgramThumbnail
                thumbnailUrl={intake.program?.thumbnail_url}
                title={programTitle}
              />
              <div className='min-w-0 flex-1 space-y-1'>
                <p className='text-foreground/90 text-[13px] font-semibold'>
                  {programTitle}
                </p>
                <p className='text-muted-foreground text-xs leading-snug font-medium wrap-break-word'>
                  {intake.program?.code?.trim() || 'No program code'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='border-border max-w-full min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-5 lg:col-span-3 lg:p-6'>
        <h3 className='text-foreground text-sm font-semibold'>
          Assessment Questionnaire Responses
        </h3>
        <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
          Review submitted answers by section to quickly verify client-provided
          details before making follow-up decisions.
        </p>
        {intakeSections.length ? (
          <Tabs
            defaultValue={String(intakeSections[0]?.id)}
            className='mt-4 space-y-4'
          >
            <TabsList
              variant='line'
              className='bg-muted! border-border mb-4 w-full min-w-0 flex-nowrap justify-start overflow-x-auto border [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
            >
              {intakeSections.map((section, index) => (
                <TabsTrigger
                  key={section.id}
                  value={String(section.id)}
                  className='shrink-0 gap-2 text-[13px] font-semibold'
                >
                  <span className='shrink-0 text-inherit tabular-nums'>
                    {index + 1}.
                  </span>
                  <span className='min-w-0 wrap-break-word text-inherit'>
                    {section.title}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {intakeSections.map((section) => (
              <TabsContent
                key={section.id}
                value={String(section.id)}
                className='mt-0 space-y-3'
              >
                {section.description?.trim() ? (
                  <p className='text-muted-foreground text-[13px] leading-relaxed font-medium'>
                    {section.description.trim()}
                  </p>
                ) : null}
                <div>
                  {section.questions.length ? (
                    section.questions.every(
                      (question) => question.type === 'file',
                    ) ? (
                      <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
                        {section.questions.map((question) => (
                          <FileAnswerPreview
                            key={question.id}
                            question={question}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className='grid gap-3 md:grid-cols-2'>
                        {section.questions.map((question, index) => (
                          <div
                            key={question.id}
                            className='border-border/70 bg-muted/10 space-y-1.5 rounded-md border p-3'
                          >
                            <p className='text-foreground/90 text-[13px] font-semibold'>
                              <span className='mr-1 font-semibold'>
                                Q{index + 1}.
                              </span>
                              {question.question}
                            </p>
                            <p className='text-muted-foreground ml-6 text-[13px] leading-relaxed font-medium wrap-break-word capitalize'>
                              {getReadableAnswer(question)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <p className='text-muted-foreground p-4 text-sm'>-</p>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <p className='text-muted-foreground mt-3 text-sm'>
            No intake responses available.
          </p>
        )}
      </section>
    </div>
  );
}
