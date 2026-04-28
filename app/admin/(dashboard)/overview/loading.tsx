import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className='space-y-5'>
      <div className='flex flex-col space-y-1'>
        <Skeleton className='h-3 w-48 rounded-sm' />
        <Skeleton className='h-6 w-56 rounded-sm' />
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={`overview-kpi-skeleton-${index}`}
            className='rounded-md border border-border bg-white p-4'
          >
            <div className='mb-2 flex items-center justify-between gap-3'>
              <Skeleton className='h-3 w-28 rounded-sm' />
              <Skeleton className='size-7 rounded-md' />
            </div>
            <Skeleton className='h-7 w-16' />
            <Skeleton className='mt-2 h-3 w-24 rounded-sm' />
          </div>
        ))}
      </div>

      <div className='border-border rounded-md border bg-white p-4 shadow-xs md:p-5'>
        <div className='mb-6 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-8'>
          <div className='space-y-1.5 lg:max-w-2xl'>
            <Skeleton className='h-4 w-44 rounded-sm' />
            <Skeleton className='h-3 w-full rounded-sm' />
            <Skeleton className='h-3 w-5/6 rounded-sm' />
          </div>
          <div className='border-border bg-background inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px]'>
            <Skeleton className='size-3.5 rounded-full' />
            <Skeleton className='h-3 w-24 rounded-sm' />
            <Skeleton className='h-3 w-28 rounded-sm' />
          </div>
        </div>

        <div className='space-y-4'>
          <div className='grid gap-4 lg:grid-cols-2'>
            <div className='border-border bg-background rounded-md border p-4 md:p-5'>
              <div className='mb-3 space-y-1.5'>
                <Skeleton className='h-4 w-44 rounded-sm' />
                <Skeleton className='h-3 w-full rounded-sm' />
                <Skeleton className='h-3 w-4/5 rounded-sm' />
              </div>
              <div className='space-y-3 pt-3'>
                <Skeleton className='h-72 w-full rounded-md' />
                <div className='grid grid-cols-4 gap-2'>
                  <Skeleton className='h-3 w-full rounded-sm' />
                  <Skeleton className='h-3 w-full rounded-sm' />
                  <Skeleton className='h-3 w-full rounded-sm' />
                  <Skeleton className='h-3 w-full rounded-sm' />
                </div>
              </div>
            </div>

            <div className='border-border bg-background rounded-md border p-4 md:p-5'>
              <div className='mb-3 space-y-1.5'>
                <Skeleton className='h-4 w-44 rounded-sm' />
                <Skeleton className='h-3 w-full rounded-sm' />
                <Skeleton className='h-3 w-4/5 rounded-sm' />
              </div>
              <div className='space-y-3 pt-3'>
                <Skeleton className='h-72 w-full rounded-md' />
                <div className='grid grid-cols-6 gap-2'>
                  <Skeleton className='h-3 w-full rounded-sm' />
                  <Skeleton className='h-3 w-full rounded-sm' />
                  <Skeleton className='h-3 w-full rounded-sm' />
                  <Skeleton className='h-3 w-full rounded-sm' />
                  <Skeleton className='h-3 w-full rounded-sm' />
                  <Skeleton className='h-3 w-full rounded-sm' />
                </div>
              </div>
            </div>
          </div>

          <div className='border-border bg-background rounded-md border p-4 md:p-5'>
            <div className='mb-3 space-y-1.5'>
              <Skeleton className='h-4 w-52 rounded-sm' />
              <Skeleton className='h-3 w-full rounded-sm' />
              <Skeleton className='h-3 w-4/5 rounded-sm' />
            </div>
            <div className='space-y-3 pt-3'>
              <Skeleton className='h-80 w-full rounded-md' />
              <div className='space-y-2'>
                <Skeleton className='h-3 w-full rounded-sm' />
                <Skeleton className='h-3 w-[92%] rounded-sm' />
                <Skeleton className='h-3 w-[84%] rounded-sm' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
