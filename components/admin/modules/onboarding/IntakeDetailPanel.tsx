'use client';

import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { PenSquareIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { type ReactNode, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TableCellEmpty from '@/components/ui/table-cell-empty';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/config/routes';
import { getOnboardingIntakeById } from '@/domains/intake-assessments/services';
import type {
  OnboardingIntakeQuestion,
  OnboardingIntakeSection,
} from '@/domains/intake-assessments/types';
import { getInitials } from '@/lib/utils/string';
import { cn } from '@/lib/utils/styles';

type IntakeDetailPanelProps = {
  intakeId: number;
};

/** Primary white card shell — matches {@link EnrollmentRequestDetailView}. */
const CARD_SURFACE =
  'border-border max-w-full min-w-0 rounded-md border bg-white p-6 shadow-xs';

/** Loading UI aligned with the overview + sidebar + questionnaire layout of this panel. */
function IntakeAssessmentDetailSkeleton() {
  return (
    <div className='space-y-3 lg:space-y-4'>
      <div className='grid gap-3 lg:grid-cols-3 lg:gap-4'>
        <section className={`${CARD_SURFACE} space-y-5 lg:col-span-2`}>
          <header className='border-border shrink-0 border-b pb-5'>
            <Skeleton className='h-5 w-36 rounded-sm' />
            <Skeleton className='mt-2 h-3 max-w-3xl rounded-sm' />
            <Skeleton className='mt-2 h-3 max-w-2xl rounded-sm' />
          </header>
          <div className='space-y-3'>
            <div className='grid gap-1.5 md:grid-cols-3'>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`intake-overview-metric-${i}`}
                  className='bg-muted/50 border-border flex min-h-18 min-w-0 flex-col justify-center space-y-2 rounded-md border px-2.5 py-2'
                >
                  <Skeleton className='h-3 w-24 rounded-sm' />
                  <Skeleton className='h-4 w-32 rounded-sm' />
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className='flex min-h-0 min-w-0 flex-col gap-3 lg:gap-4'>
          <section className={`${CARD_SURFACE} flex min-h-0 flex-col`}>
            <header className='border-border shrink-0 border-b pb-4'>
              <Skeleton className='h-5 w-44 rounded-sm' />
              <Skeleton className='mt-2 h-3 max-w-md rounded-sm' />
            </header>
            <div className='flex items-start gap-3 pt-5'>
              <Skeleton className='size-12 shrink-0 rounded-full' />
              <div className='min-w-0 flex-1 space-y-2'>
                <Skeleton className='h-4 w-40 rounded-sm' />
                <Skeleton className='h-3 w-56 rounded-sm' />
              </div>
            </div>
          </section>
          <section className={`${CARD_SURFACE} flex min-h-0 flex-col`}>
            <header className='border-border shrink-0 border-b pb-4'>
              <Skeleton className='h-5 w-48 rounded-sm' />
              <Skeleton className='mt-2 h-3 max-w-md rounded-sm' />
            </header>
            <div className='flex items-start gap-3 pt-5'>
              <Skeleton className='size-12 shrink-0 rounded-md' />
              <div className='min-w-0 flex-1 space-y-2'>
                <Skeleton className='h-4 w-48 rounded-sm' />
                <Skeleton className='h-3 w-28 rounded-sm' />
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className={`${CARD_SURFACE} flex min-h-0 flex-col`}>
        <header className='border-border flex flex-wrap items-start justify-between gap-4 border-b pb-4'>
          <div className='min-w-0 flex-1 space-y-2'>
            <Skeleton className='h-5 w-56 rounded-sm' />
            <Skeleton className='h-3 max-w-3xl rounded-sm' />
            <Skeleton className='h-3 max-w-2xl rounded-sm' />
          </div>
          <Skeleton className='h-10 w-44 shrink-0 rounded-md' />
        </header>
        <div className='flex min-h-0 flex-1 flex-col space-y-4 pt-5'>
          <Skeleton className='h-10 w-full max-w-2xl rounded-md' />
          <div className='border-border bg-muted/20 rounded-md border p-3.5 sm:p-4'>
            <Skeleton className='mb-3 h-3 w-72 rounded-sm' />
            <div className='grid gap-3 md:grid-cols-2'>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`intake-qa-${i}`}
                  className='border-border bg-muted/10 space-y-2 rounded-md border p-3'
                >
                  <Skeleton className='h-4 w-full max-w-sm rounded-sm' />
                  <Skeleton className='ml-6 h-3 w-full rounded-sm' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Matches enrollment detail primary actions. */
const ADMIN_PRIMARY_BUTTON_CLASS =
  'normal-case h-10 shrink-0 gap-1.5 rounded-md px-3 text-[13px]! font-semibold';

/** Shared muted tile shell — matches {@link EnrollmentRequestDetailView} overview KPIs. */
const METRIC_TILE_CLASS =
  'bg-muted/50 border-border flex min-h-18 flex-col justify-center rounded-md border px-2.5 py-2';

const METRIC_TILE_LABEL_CLASS =
  'text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wide uppercase';

const OVERVIEW_EMPTY_DASH = (
  <span className='text-muted-foreground font-semibold'>-</span>
);

/** Date-only display for overview tiles (matches enrollment request detail). */
function formatDateOnly(iso: string | null | undefined): string {
  if (!iso?.trim()) return 'Not set';
  try {
    return format(parseISO(iso.trim()), 'dd-MMMM-yyyy');
  } catch {
    return iso.trim();
  }
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
    <div className='border-border bg-muted/20 w-full min-w-0 space-y-3 rounded-md border p-3'>
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
    <Avatar size='lg' className='mt-0.5 shrink-0' aria-hidden>
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

/** Single metric cell — matches {@link EnrollmentRequestDetailView} `EnrollmentOverviewMetricTile`. */
function IntakeOverviewMetricTile({
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

/** Cancellation block — same surface as overview metric tiles (`METRIC_TILE_CLASS`). */
function IntakeStateNote({
  title,
  metaValue,
  children,
}: {
  title: string;
  metaValue: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      role='status'
      className={cn(
        METRIC_TILE_CLASS,
        'min-h-0 justify-start space-y-2 py-3 text-[13px]',
      )}
    >
      <p className={METRIC_TILE_LABEL_CLASS}>{title}</p>
      <div className='text-foreground/90 text-[12.5px] leading-snug font-semibold tabular-nums'>
        {metaValue}
      </div>
      <div className='text-muted-foreground border-border space-y-1 border-t pt-2 text-[12.5px] leading-relaxed font-medium'>
        {children}
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
    return <IntakeAssessmentDetailSkeleton />;
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
  const programLabel =
    intake.program?.title?.trim() || intake.program?.slug?.trim() || '—';
  const programCode = intake.program?.code?.trim()
    ? intake.program.code.trim()
    : '—';
  const templateLabel = `${intake.template?.title || 'Unknown template'} (v${
    intake.template?.version ?? '—'
  })`;
  const intakeSections = [...(intake.template?.sections ?? [])].sort(
    (left: OnboardingIntakeSection, right: OnboardingIntakeSection) =>
      left.sort_order - right.sort_order,
  );

  const intakeStatus = asIntakeStatus(intake.status);
  const statusDisplay = intakeStatus
    ? INTAKE_STATUS_LABEL[intakeStatus]
    : intake.status;

  return (
    <div className='space-y-3 lg:space-y-4'>
      <div className='grid gap-3 lg:grid-cols-3 lg:gap-4'>
        <section className={`${CARD_SURFACE} space-y-5 lg:col-span-2`}>
          <header className='border-border shrink-0 border-b pb-5'>
            <h3 className='text-foreground text-sm font-semibold'>Overview</h3>
            <p className='text-muted-foreground mt-1 max-w-3xl text-[13px] leading-relaxed font-medium'>
              Reference, template, workflow status, and important dates for this
              onboarding record. Use it to orient quickly; full answers are in
              the questionnaire section below.
            </p>
          </header>

          <div className='space-y-3'>
            <div className='grid gap-1.5 md:grid-cols-3'>
              <IntakeOverviewMetricTile
                label='Assessment reference'
                value={intakeLabel}
                tabularNums={false}
              />
              <IntakeOverviewMetricTile
                label='Template'
                value={templateLabel}
                tabularNums={false}
              />
              <IntakeOverviewMetricTile
                label='Assessment status'
                value={statusDisplay}
                tabularNums={false}
              />
              <IntakeOverviewMetricTile
                label='Created at'
                value={formatDateOnly(intake.timestamps.created_at)}
              />
              <IntakeOverviewMetricTile
                label='Last updated at'
                value={formatDateOnly(intake.timestamps.updated_at)}
              />
              <IntakeOverviewMetricTile
                label='Completed at'
                value={
                  intake.timestamps.completed_at?.trim()
                    ? formatDateOnly(intake.timestamps.completed_at)
                    : OVERVIEW_EMPTY_DASH
                }
              />
            </div>

            {intake.cancellation_note?.trim() ||
            intake.timestamps.cancelled_at?.trim() ? (
              <IntakeStateNote
                title='Cancellation'
                metaValue={
                  intake.timestamps.cancelled_at?.trim()
                    ? formatDateOnly(intake.timestamps.cancelled_at)
                    : '—'
                }
              >
                {intake.cancellation_note?.trim() ? (
                  <p className='whitespace-pre-wrap'>
                    {intake.cancellation_note.trim()}
                  </p>
                ) : (
                  <p className='text-muted-foreground text-[12.5px] leading-relaxed'>
                    No cancellation note was recorded.
                  </p>
                )}
              </IntakeStateNote>
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
                Person linked to this intake. Confirm identity here before
                reviewing questionnaire answers.
              </p>
            </header>
            {intake.client ? (
              <div className='flex min-h-0 flex-1 flex-col gap-4 pt-5'>
                <div className='flex min-w-0 items-start gap-3'>
                  <PersonAvatar
                    name={intake.client.name}
                    pictureUrl={intake.client.picture_url}
                  />
                  <div className='min-w-0 flex-1 space-y-1'>
                    <p className='text-foreground/90 text-[13px] font-semibold'>
                      {intake.client.name?.trim() || (
                        <TableCellEmpty label='No name on file' />
                      )}
                    </p>
                    <p className='text-muted-foreground text-xs leading-snug font-medium wrap-break-word'>
                      {intake.client.email?.trim() || 'No email on file'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className='text-muted-foreground pt-5 text-sm'>
                No applicant account linked to this intake.
              </p>
            )}
          </section>

          <section className={`${CARD_SURFACE} flex min-h-0 flex-col`}>
            <header className='border-border shrink-0 border-b pb-4'>
              <h3 className='text-foreground text-sm font-semibold'>
                Requested Program
              </h3>
              <p className='text-muted-foreground mt-1 max-w-3xl text-[13px] leading-relaxed font-medium'>
                Program selected at the time of application. Use this as the
                reference for intake, contract, and enrollment.
              </p>
            </header>
            {intake.program ? (
              <div className='flex min-h-0 flex-1 flex-col gap-4 pt-5'>
                <div className='flex items-start gap-3'>
                  <ProgramThumbnail
                    thumbnailUrl={intake.program.thumbnail_url}
                    title={programLabel !== '—' ? programLabel : 'Program'}
                  />
                  <div className='min-w-0 flex-1 space-y-1'>
                    <p className='text-foreground/90 text-[13px] font-semibold'>
                      {programLabel !== '—' ? (
                        programLabel
                      ) : (
                        <TableCellEmpty label='No title' />
                      )}
                    </p>
                    <p className='text-muted-foreground text-xs leading-snug font-medium'>
                      {programCode !== '—' ? programCode : 'No program code'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className='text-muted-foreground pt-5 text-sm'>
                No program linked to this request.
              </p>
            )}
          </section>
        </div>
      </div>

      <section className={`${CARD_SURFACE} flex min-h-0 flex-col`}>
        <header className='border-border flex flex-wrap items-start justify-between gap-4 border-b pb-4'>
          <div className='min-w-0 flex-1 space-y-1'>
            <h3 className='text-foreground text-sm font-semibold'>
              Questionnaire Responses
            </h3>
            <p className='text-muted-foreground mt-1 max-w-3xl text-[13px] leading-relaxed font-medium'>
              Answers captured for this intake, grouped by template section. Use
              the tabs to review each part in a compact grid.
            </p>
          </div>
          {isEditable ? (
            <Button
              className={`${ADMIN_PRIMARY_BUTTON_CLASS} w-full sm:w-auto`}
              asChild
            >
              <Link
                href={ROUTES.ADMIN.MODULES.INTAKE_ASSESSMENTS.INTERVIEW(
                  String(intake.id),
                )}
              >
                <PenSquareIcon className='size-3.5' />
                Continue Interview
              </Link>
            </Button>
          ) : null}
        </header>
        <div className='flex min-h-0 flex-1 flex-col pt-5'>
          {intakeSections.length ? (
            <Tabs
              defaultValue={String(intakeSections[0]?.id)}
              className='space-y-4'
            >
              <TabsList
                variant='line'
                className='bg-muted! border-border w-full min-w-0 flex-nowrap justify-start overflow-x-auto border [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
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
                  <div className='border-border bg-muted/20 rounded-md border p-3.5 sm:p-4'>
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
                              className='border-border bg-muted/10 min-w-0 space-y-1.5 rounded-md border p-3'
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
                      <p className='text-muted-foreground text-sm'>-</p>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <p className='text-muted-foreground text-sm'>
              No intake responses available.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
