'use client';

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { DashboardTrendPoint } from '@/domains/dashboard-overview/types';

const chartConfig = {
  requests: { label: 'Requests', color: 'var(--chart-1)' },
  enrollments: { label: 'Enrollments', color: 'var(--chart-2)' },
} as const;

type RequestsEnrollmentsChartCardProps = {
  points: DashboardTrendPoint[];
};

export default function RequestsEnrollmentsChartCard({
  points,
}: RequestsEnrollmentsChartCardProps) {
  return (
    <div className='border-border bg-background rounded-md border p-4 md:p-5'>
      <div className='mb-3 space-y-1.5'>
        <h3 className='text-foreground text-[13.5px]! font-semibold'>
          Request vs Enrollment Trend
        </h3>
        <p className='text-muted-foreground text-xs font-medium'>
          Track monthly enrollment requests against enrollment records to monitor
          growth momentum and operational throughput.
        </p>
      </div>
      <div className='pt-3'>
        {points.length ? (
          <ChartContainer
            className='ml-1 h-72 w-[calc(100%+0.75rem)]'
            config={chartConfig}
          >
            <LineChart
              data={points}
              margin={{ top: 8, right: 4, bottom: 0, left: -8 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='period'
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tick={{ fontSize: 12, fontWeight: 500 }}
              />
              <YAxis
                allowDecimals={false}
                width={30}
                tick={{ fontSize: 12, fontWeight: 500 }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => String(label)}
                  />
                }
              />
              <Line
                type='monotone'
                dataKey='requests'
                stroke='var(--color-requests)'
                strokeWidth={2}
                dot={false}
              />
              <Line
                type='monotone'
                dataKey='enrollments'
                stroke='var(--color-enrollments)'
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <p className='text-muted-foreground text-sm'>
            No request/enrollment activity yet.
          </p>
        )}
      </div>
    </div>
  );
}
