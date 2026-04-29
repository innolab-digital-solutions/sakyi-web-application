'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { OverviewChartEmptyState } from '@/components/admin/modules/overview/OverviewChartEmptyState';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import type { DashboardProgramWorkload } from '@/domains/dashboard-overview/types';

const chartConfig = {
  active_enrollments: {
    label: 'Active Enrollments',
    color: 'var(--primary)',
  },
} as const;

type ActiveWorkloadChartCardProps = {
  bars: DashboardProgramWorkload[];
  isLoading?: boolean;
};

function hasWorkloadChartData(bars: DashboardProgramWorkload[]) {
  return bars.some((bar) => bar.active_enrollments > 0);
}

export default function ActiveWorkloadChartCard({
  bars,
  isLoading = false,
}: ActiveWorkloadChartCardProps) {
  const showChart = hasWorkloadChartData(bars);

  return (
    <div className='border-border bg-background rounded-md border p-4 md:p-5'>
      <div className='mb-3 space-y-1.5'>
        <h3 className='text-foreground text-[13.5px]! font-semibold'>
          Program Workload Distribution
        </h3>
        <p className='text-muted-foreground text-xs font-medium'>
          Compare active enrollment volume by program to balance operational
          capacity and prioritize delivery planning.
        </p>
      </div>
      <div className='pt-3'>
        {isLoading ? (
          <div className='space-y-3'>
            <Skeleton className='h-80 w-full rounded-md' />
            <div className='space-y-2'>
              <Skeleton className='h-3 w-full rounded-sm' />
              <Skeleton className='h-3 w-[92%] rounded-sm' />
              <Skeleton className='h-3 w-[84%] rounded-sm' />
            </div>
          </div>
        ) : showChart ? (
          <ChartContainer className='h-80 w-full pr-2' config={chartConfig}>
            <BarChart
              data={bars}
              layout='vertical'
              margin={{ top: 8, right: 14, bottom: 0, left: 0 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis
                type='number'
                allowDecimals={false}
                tick={{ fontSize: 12, fontWeight: 500 }}
              />
              <YAxis
                type='category'
                dataKey='program_title'
                width={178}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fontWeight: 500 }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator='dot' />}
              />
              <Bar
                dataKey='active_enrollments'
                fill='var(--color-active_enrollments)'
                radius={8}
                barSize={42}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <OverviewChartEmptyState
            variant='tall'
            title='No program workload to display'
            description='Active enrollments by program will appear here when at least one program carries active enrollment volume.'
          />
        )}
      </div>
    </div>
  );
}
