import TableSkeletonRows from '@/components/shared/table/TableSkeletonRows';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type AdminTablePageSkeletonProps = {
  rows?: number;
};

export function AdminTablePageSkeleton({
  rows = 10,
}: AdminTablePageSkeletonProps) {
  return (
    <div className='border-border bg-background space-y-4 rounded-md border p-4 md:p-5'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <Skeleton className='h-9 w-64 rounded-md' />
        <div className='flex items-center gap-2'>
          <Skeleton className='h-9 w-28 rounded-md' />
          <Skeleton className='h-9 w-28 rounded-md' />
        </div>
      </div>
      <div className='space-y-2'>
        <div className='grid grid-cols-8 gap-2'>
          {Array.from({ length: 8 }).map((_, idx) => (
            <Skeleton key={`table-head-${idx}`} className='h-4 rounded-sm' />
          ))}
        </div>
        <div className='space-y-2'>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <Skeleton
              key={`table-row-${rowIndex}`}
              className='h-11 w-full rounded-md'
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminDetailCardSkeleton() {
  return (
    <div className='border-border bg-background space-y-5 rounded-md border p-4 md:p-5'>
      <div className='space-y-2'>
        <Skeleton className='h-5 w-44 rounded-sm' />
        <Skeleton className='h-3 w-72 rounded-sm' />
      </div>
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={`detail-cell-${idx}`}
            className='border-border bg-muted/30 space-y-2 rounded-md border p-3'
          >
            <Skeleton className='h-3 w-24 rounded-sm' />
            <Skeleton className='h-4 w-32 rounded-sm' />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminFormPageSkeleton() {
  return (
    <div className='border-border bg-background space-y-5 rounded-md border p-4 md:p-5'>
      <div className='grid gap-4 md:grid-cols-2'>
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={`form-field-${idx}`} className='space-y-2'>
            <Skeleton className='h-3 w-28 rounded-sm' />
            <Skeleton className='h-10 w-full rounded-md' />
          </div>
        ))}
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-3 w-32 rounded-sm' />
        <Skeleton className='h-28 w-full rounded-md' />
      </div>
      <div className='flex justify-end gap-2'>
        <Skeleton className='h-10 w-28 rounded-md' />
        <Skeleton className='h-10 w-36 rounded-md' />
      </div>
    </div>
  );
}

export function AdminWorkspaceSkeleton() {
  return (
    <div className='border-border bg-background space-y-4 rounded-md border p-4 md:p-5'>
      <div className='space-y-2'>
        <Skeleton className='h-5 w-56 rounded-sm' />
        <Skeleton className='h-3 w-80 rounded-sm' />
      </div>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
        <div className='border-border space-y-2 rounded-md border p-3 lg:col-span-3'>
          {Array.from({ length: 7 }).map((_, idx) => (
            <Skeleton key={`workspace-nav-${idx}`} className='h-11 w-full' />
          ))}
        </div>
        <div className='border-border space-y-3 rounded-md border p-4 lg:col-span-9'>
          <Skeleton className='h-10 w-full rounded-md' />
          <Skeleton className='h-4 w-3/4 rounded-sm' />
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={`workspace-body-${idx}`} className='h-24 w-full' />
          ))}
          <div className='flex justify-end gap-2'>
            <Skeleton className='h-10 w-28 rounded-md' />
            <Skeleton className='h-10 w-36 rounded-md' />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Matches `{@link OperationalLogWorkspaceContextBar}` and overview metric shells. */
const METRIC_SURFACE =
  'bg-muted/50 border-border flex min-h-18 flex-col justify-center rounded-md border px-2.5 py-2';

function CarePlanSixContextTilesSkeleton() {
  return (
    <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
      <div className={METRIC_SURFACE}>
        <Skeleton className='mb-1.5 h-3 max-w-[5.5rem] rounded-sm' />
        <div className='mt-1 flex min-w-0 items-center gap-2.5'>
          <Skeleton className='border-border size-9 shrink-0 rounded-full border' />
          <div className='min-w-0 flex-1 space-y-1.5'>
            <Skeleton className='h-4 max-w-[12rem]' />
            <Skeleton className='h-3 max-w-[6rem]' />
          </div>
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, idx) => (
        <div key={`ctx-tile-${idx}`} className={METRIC_SURFACE}>
          <Skeleton className='mb-1.5 h-3 max-w-[6rem] rounded-sm' />
          <Skeleton className='h-4 max-w-[11rem]' />
          <Skeleton className='mt-1 h-3 max-w-[5rem]' />
        </div>
      ))}
    </div>
  );
}

function OperationalLogFourContextTilesSkeleton() {
  return (
    <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-4'>
      <div className={METRIC_SURFACE}>
        <Skeleton className='mb-1.5 h-3 max-w-[4rem] rounded-sm' />
        <div className='mt-1 flex min-w-0 items-center gap-2.5'>
          <Skeleton className='border-border size-9 shrink-0 rounded-full border' />
          <div className='min-w-0 flex-1 space-y-1.5'>
            <Skeleton className='h-4 max-w-[10rem]' />
            <Skeleton className='h-3 max-w-[5.5rem]' />
          </div>
        </div>
      </div>
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={`op-ctx-${idx}`} className={METRIC_SURFACE}>
          <Skeleton className='mb-1.5 h-3 max-w-[7rem] rounded-sm' />
          <Skeleton className='h-4 max-w-[10rem]' />
          <Skeleton className='mt-1 h-3 max-w-[6rem]' />
        </div>
      ))}
    </div>
  );
}

/**
 * Summary strip for {@link CarePlanLogEntriesView} — six metric tiles + log progress bar.
 */
export function CarePlanLogSummarySkeleton() {
  return (
    <div className='space-y-5'>
      <CarePlanSixContextTilesSkeleton />
      <div className='space-y-1.5'>
        <div className='flex items-baseline justify-between gap-3'>
          <Skeleton className='h-3 w-28 rounded-sm' />
          <Skeleton className='h-4 w-9 rounded-sm' />
        </div>
        <Skeleton className='h-2.5 w-full rounded-full' />
      </div>
    </div>
  );
}

/**
 * Main worksheet area for operational logs (evidence column + metric editors), inside the white shell.
 */
export function OperationalLogWorksheetSkeleton() {
  return (
    <div className='space-y-5'>
      <div className='space-y-1'>
        <Skeleton className='h-4 w-64 max-w-[min(24rem,90vw)] rounded-sm' />
        <Skeleton className='h-[13px] w-full max-w-2xl rounded-sm' />
        <Skeleton className='h-[13px] w-full max-w-xl rounded-sm' />
      </div>
      <div className='grid min-h-0 grid-cols-1 items-start gap-5 lg:grid-cols-3 lg:gap-6'>
        <div className='min-h-0 min-w-0 space-y-2 lg:col-span-1'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`evidence-sk-${i}`}
              className='border-border space-y-2 rounded-md border p-3'
            >
              <Skeleton className='h-3 w-24 rounded-sm' />
              <Skeleton className='h-14 w-full rounded-md' />
            </div>
          ))}
        </div>
        <div className='min-w-0 space-y-4 lg:col-span-2'>
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={`metric-sk-${i}`}
              className='border-border space-y-3 rounded-md border p-4'
            >
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <Skeleton className='h-4 w-36 rounded-sm' />
                <Skeleton className='h-8 w-24 rounded-md' />
              </div>
              <Skeleton className='h-20 w-full rounded-md' />
              <Skeleton className='h-10 w-full rounded-md' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Full operational logs workspace body (Suspense + initial route paint) under `PageHeader`.
 */
export function OperationalLogsWorkspaceFullSkeleton() {
  return (
    <div className='space-y-6'>
      <section className='border-border max-w-full min-w-0 space-y-5 rounded-md border bg-white p-4 shadow-xs sm:p-5 lg:p-6'>
        <div className='space-y-4'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div className='min-w-0 space-y-1.5'>
              <Skeleton className='h-3 w-44 rounded-sm' />
              <Skeleton className='h-[13px] w-48 max-w-full rounded-sm' />
              <Skeleton className='h-3 w-56 max-w-full rounded-sm' />
            </div>
            <Skeleton className='h-10 w-44 rounded-md' />
          </div>
          <div className='border-border/70 border-t' />
          <OperationalLogFourContextTilesSkeleton />
        </div>
        <div className='border-border/70 border-t' />
        <OperationalLogWorksheetSkeleton />
      </section>
    </div>
  );
}

/**
 * {@link CarePlanBuilder} — overview card + day schedule / editor grid.
 */
export function CarePlanBuilderSkeleton() {
  return (
    <div className='space-y-6'>
      <section className='border-border max-w-full min-w-0 space-y-5 rounded-md border bg-white p-4 shadow-xs sm:p-5 lg:p-6'>
        <div className='space-y-4'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='space-y-1.5'>
              <Skeleton className='h-3 w-40 rounded-sm' />
              <Skeleton className='h-[13px] w-52 max-w-full rounded-sm' />
            </div>
            <Skeleton className='h-10 min-w-[8rem] rounded-md' />
          </div>
          <div className='border-border/70 border-t' />
          <CarePlanSixContextTilesSkeleton />
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
          <div className='border-border flex max-h-[min(78vh,640px)] flex-col overflow-hidden rounded-md border bg-white lg:col-span-3'>
            <div className='border-border bg-card border-b px-3 py-2.5'>
              <Skeleton className='h-4 w-28 rounded-sm' />
            </div>
            <div className='min-h-0 flex-1 space-y-1 overflow-hidden bg-white p-1.5'>
              {Array.from({ length: 8 }).map((_, idx) => (
                <Skeleton
                  key={`day-sk-${idx}`}
                  className='h-[3.25rem] w-full rounded-md'
                />
              ))}
            </div>
          </div>
          <div className='space-y-4 lg:col-span-9'>
            <div className='border-border space-y-3 rounded-md border bg-white p-4 md:p-5'>
              <Skeleton className='h-10 w-full rounded-md md:max-w-md' />
              <Skeleton className='h-4 w-full max-w-lg rounded-sm' />
              <Skeleton className='h-32 w-full rounded-md' />
              <Skeleton className='h-32 w-full rounded-md' />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Period {@link CarePlanReportWorkspace} (non–operational-logs) sticky header + two-column grid. */
export function PeriodReportWorkspaceSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='bg-card sticky top-0 z-10 flex flex-col gap-3 rounded-md border p-4 shadow-sm'>
        <div className='flex w-full flex-col gap-3 md:flex-row md:items-end md:justify-between'>
          <div className='min-w-0 flex-1 space-y-2'>
            <Skeleton className='h-6 w-full max-w-md rounded-sm' />
            <Skeleton className='h-4 w-full max-w-xs rounded-sm' />
          </div>
          <Skeleton className='h-10 w-full max-w-[16rem] rounded-md md:w-56 md:max-w-none' />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
        <section className='border-border lg:col-span-5'>
          <div className='space-y-3 rounded-md border p-3'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`period-ev-${i}`} className='space-y-2'>
                <Skeleton className='h-4 w-40 rounded-sm' />
                <Skeleton className='h-24 w-full rounded-md' />
              </div>
            ))}
          </div>
        </section>

        <section className='space-y-6 lg:col-span-7'>
          <div className='space-y-3 rounded-md border p-4'>
            <Skeleton className='h-4 w-32 rounded-sm' />
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <Skeleton className='h-10 w-full rounded-md' />
              <Skeleton className='h-10 w-full rounded-md' />
            </div>
            <Skeleton className='h-9 w-40 rounded-md' />
          </div>
          <div className='space-y-3 rounded-md border p-4'>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={`period-metric-${i}`} className='space-y-2'>
                <Skeleton className='h-4 w-36 rounded-sm' />
                <Skeleton className='h-24 w-full rounded-md' />
              </div>
            ))}
          </div>
          <div className='space-y-3 rounded-md border p-4'>
            <Skeleton className='h-4 w-40 rounded-sm' />
            <Skeleton className='h-20 w-full rounded-md' />
            <Skeleton className='h-20 w-full rounded-md' />
          </div>
          <div className='flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end'>
            <Skeleton className='h-10 w-36 rounded-md' />
            <Skeleton className='h-10 w-32 rounded-md' />
            <Skeleton className='h-10 w-44 rounded-md' />
          </div>
        </section>
      </div>
    </div>
  );
}

/** Client profile “Profile media” table while the detail query resolves. */
export function ClientProfileMediaTableSkeleton() {
  return (
    <div className='border-border space-y-5 border-t pt-5'>
      <header className='border-border shrink-0 border-b pb-4'>
        <Skeleton className='h-5 w-40 rounded-sm' />
        <Skeleton className='mt-1 h-[13px] w-full max-w-3xl rounded-sm' />
      </header>
      <div className='border-border overflow-hidden rounded-md border'>
        <Table>
          <TableHeader className='bg-muted/50 [&_tr]:border-border'>
            <TableRow className='border-border hover:bg-transparent'>
              <TableHead>
                <Skeleton className='h-3 w-14 rounded-sm' />
              </TableHead>
              <TableHead>
                <Skeleton className='h-3 w-24 rounded-sm' />
              </TableHead>
              <TableHead className='text-right'>
                <div className='flex justify-end'>
                  <Skeleton className='h-3 w-16 rounded-sm' />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableSkeletonRows
              rowCount={4}
              columnCount={3}
              cellWidths={['w-full', 'w-44', 'w-28']}
            />
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
