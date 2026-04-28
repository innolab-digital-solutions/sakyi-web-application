'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { DashboardProgramWorkload } from '@/domains/dashboard-overview/types';

const chartConfig = {
  active_enrollments: {
    label: 'Active Enrollments',
    color: 'var(--chart-3)',
  },
} as const;

type ActiveWorkloadChartCardProps = {
  bars: DashboardProgramWorkload[];
};

export default function ActiveWorkloadChartCard({
  bars,
}: ActiveWorkloadChartCardProps) {
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
        {bars.length ? (
          <ChartContainer className='ml-1 h-80 w-[calc(100%+0.75rem)]' config={chartConfig}>
            <BarChart
              data={bars}
              layout='vertical'
              margin={{ top: 8, right: 6, bottom: 0, left: -8 }}
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
                radius={10}
                barSize={34}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <p className='text-muted-foreground text-sm'>
            No active enrollments by program.
          </p>
        )}
      </div>
    </div>
  );
}
