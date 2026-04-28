'use client';

import { AlertTriangle, Clock3Icon } from 'lucide-react';

import ActiveWorkloadChartCard from '@/components/admin/modules/overview/ActiveWorkloadChartCard';
import PipelineFunnelChartCard from '@/components/admin/modules/overview/PipelineFunnelChartCard';
import RequestsEnrollmentsChartCard from '@/components/admin/modules/overview/RequestsEnrollmentsChartCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { DashboardOverviewData } from '@/domains/dashboard-overview/types';

type OperationalOverviewCardProps = {
  overviewError: string | null;
  generatedAtText: string;
  overviewData: DashboardOverviewData | null;
  isLoading?: boolean;
};

export default function OperationalOverviewCard({
  overviewError,
  generatedAtText,
  overviewData,
  isLoading = false,
}: OperationalOverviewCardProps) {
  return (
    <div className='border-border rounded-md border bg-white p-4 shadow-xs md:p-5'>
      <div className='mb-6 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-8'>
        <div className='space-y-1.5 lg:max-w-2xl'>
          <h2 className='text-foreground/90 text-[14.5px]! font-semibold'>
            Operational Performance Summary
          </h2>
          <p className='text-muted-foreground text-[12.5px]! font-medium'>
            Review stage-by-stage pipeline conversion, monthly request versus
            enrollment movement, and active workload distribution across programs.
          </p>
        </div>
        <div className='lg:ml-6 lg:pt-0.5'>
          <div className='border-border bg-background inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px]'>
            <Clock3Icon className='text-muted-foreground size-3.5' />
            <span className='text-muted-foreground font-medium capitalize'>
              Last processed:
            </span>
            {isLoading ? (
              <Skeleton className='h-3.5 w-28 rounded-sm' />
            ) : (
              <span className='text-foreground/90 font-semibold'>
                {generatedAtText}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        {overviewError ? (
          <div className='rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
            <div className='flex items-center gap-2'>
              <AlertTriangle className='h-4 w-4' />
              {overviewError}
            </div>
          </div>
        ) : null}

        <div className='grid gap-4 lg:grid-cols-2'>
          <PipelineFunnelChartCard
            stages={overviewData?.charts.pipeline_funnel.stages ?? []}
            isLoading={isLoading}
          />
          <RequestsEnrollmentsChartCard
            points={overviewData?.charts.request_enrollment_trend.points ?? []}
            isLoading={isLoading}
          />
        </div>

        <ActiveWorkloadChartCard
          bars={overviewData?.charts.active_workload_by_program.bars ?? []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
