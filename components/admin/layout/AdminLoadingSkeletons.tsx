import { Skeleton } from '@/components/ui/skeleton';

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
