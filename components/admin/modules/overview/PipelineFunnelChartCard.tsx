'use client';

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';

import { OverviewChartEmptyState } from '@/components/admin/modules/overview/OverviewChartEmptyState';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import type { DashboardPipelineStage } from '@/domains/dashboard-overview/types';

const chartConfig = {
  count: { label: 'Count', color: 'var(--chart-1)' },
} as const;

type PipelineFunnelChartCardProps = {
  stages: DashboardPipelineStage[];
  isLoading?: boolean;
};

function hasPipelineChartData(stages: DashboardPipelineStage[]) {
  return stages.some((stage) => stage.count > 0);
}

export default function PipelineFunnelChartCard({
  stages,
  isLoading = false,
}: PipelineFunnelChartCardProps) {
  const showChart = hasPipelineChartData(stages);

  return (
    <div className='border-border bg-background rounded-md border p-4 md:p-5'>
      <div className='mb-3 space-y-1.5'>
        <h3 className='text-foreground text-[13.5px]! font-semibold'>
          Enrollment Pipeline Funnel
        </h3>
        <p className='text-muted-foreground text-xs font-medium'>
          Compare stage-by-stage conversion volume to identify pipeline
          drop-offs and prioritize operational follow-up.
        </p>
      </div>
      <div className='pt-3'>
        {isLoading ? (
          <div className='space-y-3'>
            <Skeleton className='h-72 w-full rounded-md' />
            <div className='grid grid-cols-4 gap-2'>
              <Skeleton className='h-3 w-full rounded-sm' />
              <Skeleton className='h-3 w-full rounded-sm' />
              <Skeleton className='h-3 w-full rounded-sm' />
              <Skeleton className='h-3 w-full rounded-sm' />
            </div>
          </div>
        ) : showChart ? (
          <ChartContainer
            className='h-72 w-full pr-2'
            config={chartConfig}
          >
            <BarChart
              data={stages}
              margin={{ top: 8, right: 14, bottom: 0, left: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='label'
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tick={{ fontSize: 12, fontWeight: 500 }}
                interval={0}
              />
              <YAxis
                allowDecimals={false}
                width={30}
                tick={{ fontSize: 12, fontWeight: 500 }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator='line' />}
              />
              <Bar
                dataKey='count'
                fill='var(--color-count)'
                radius={10}
                barSize={72}
              >
                {stages.map((entry) => (
                  <Cell key={entry.key} fill='var(--color-count)' />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <OverviewChartEmptyState
            title='No pipeline data to display'
            description='Stage counts are empty for this workspace. Volume will appear here once submissions move through enrollment.'
          />
        )}
      </div>
    </div>
  );
}
