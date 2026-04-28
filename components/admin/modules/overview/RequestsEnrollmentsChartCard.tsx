'use client';

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from 'recharts';

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
            className='h-72 w-full pr-2'
            config={chartConfig}
          >
            <ComposedChart
              data={points}
              margin={{ top: 8, right: 14, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id='overview-requests-fill' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='0%'
                    stopColor='var(--color-requests)'
                    stopOpacity={0.26}
                  />
                  <stop
                    offset='100%'
                    stopColor='var(--color-requests)'
                    stopOpacity={0.03}
                  />
                </linearGradient>
                <linearGradient
                  id='overview-enrollments-fill'
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='0%'
                    stopColor='var(--color-enrollments)'
                    stopOpacity={0.22}
                  />
                  <stop
                    offset='100%'
                    stopColor='var(--color-enrollments)'
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
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
              <Area
                type='monotone'
                dataKey='requests'
                fill='url(#overview-requests-fill)'
                stroke='none'
              />
              <Area
                type='monotone'
                dataKey='enrollments'
                fill='url(#overview-enrollments-fill)'
                stroke='none'
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
            </ComposedChart>
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
