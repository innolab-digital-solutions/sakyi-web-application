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
    <div className='rounded-md border border-border bg-white p-4 shadow-xs md:p-5'>
      <div className='space-y-2'>
        <h3 className='text-foreground text-base font-semibold'>
          Active workload by program
        </h3>
        <p className='text-muted-foreground text-sm'>
          Current active enrollments distributed by program.
        </p>
      </div>
      <div className='pt-3'>
        {bars.length ? (
          <ChartContainer className='h-80 w-full' config={chartConfig}>
            <BarChart data={bars} layout='vertical' margin={{ left: 24, right: 12 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type='number' allowDecimals={false} />
              <YAxis
                type='category'
                dataKey='program_title'
                width={170}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator='dot' />}
              />
              <Bar
                dataKey='active_enrollments'
                fill='var(--color-active_enrollments)'
                radius={8}
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
