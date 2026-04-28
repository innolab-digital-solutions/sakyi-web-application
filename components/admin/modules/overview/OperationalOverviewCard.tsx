'use client';

import { AlertTriangle } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { DashboardOverviewData } from '@/domains/dashboard-overview/types';

type OperationalOverviewCardProps = {
  overviewError: string | null;
  generatedAtText: string;
  overviewData: DashboardOverviewData | null;
};

const chartConfig = {
  requests: { label: 'Requests', color: 'var(--chart-1)' },
  enrollments: { label: 'Enrollments', color: 'var(--chart-2)' },
  active_enrollments: {
    label: 'Active Enrollments',
    color: 'var(--chart-3)',
  },
  count: { label: 'Count', color: 'var(--chart-4)' },
} as const;

export default function OperationalOverviewCard({
  overviewError,
  generatedAtText,
  overviewData,
}: OperationalOverviewCardProps) {
  return (
    <div className='rounded-md border border-border bg-white p-4 shadow-xs md:p-5'>
      <div className='mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-8'>
        <div className='space-y-1 lg:max-w-2xl'>
          <h2 className='text-foreground/90 text-[15px]! font-semibold'>
            Operations Performance Overview
          </h2>
          <p className='text-muted-foreground text-[13px]! font-medium'>
            Monitor core operational indicators across enrollment flow, care plan
            follow-up, reporting readiness, and recent user activity.
          </p>
        </div>
        <div className='lg:ml-6'>
          <Badge variant='secondary'>Updated: {generatedAtText}</Badge>
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
          <div className='rounded-md border border-border bg-white p-4 shadow-xs md:p-5'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between gap-2'>
                <h3 className='text-foreground text-base font-semibold'>
                  Pipeline funnel
                </h3>
              </div>
              <p className='text-muted-foreground text-sm'>
                Enrollment progression by stage.
              </p>
            </div>
            <div className='pt-3'>
              {overviewData?.charts.pipeline_funnel.stages.length ? (
                <ChartContainer className='h-72 w-full' config={chartConfig}>
                  <BarChart data={overviewData.charts.pipeline_funnel.stages}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey='label'
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator='line' />}
                    />
                    <Bar dataKey='count' radius={8}>
                      {overviewData.charts.pipeline_funnel.stages.map((entry) => (
                        <Cell key={entry.key} fill='var(--chart-4)' />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className='text-muted-foreground text-sm'>
                  No pipeline activity in selected period.
                </p>
              )}
            </div>
          </div>

          <div className='rounded-md border border-border bg-white p-4 shadow-xs md:p-5'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between gap-2'>
                <h3 className='text-foreground text-base font-semibold'>
                  Requests vs enrollments
                </h3>
              </div>
              <p className='text-muted-foreground text-sm'>
                Daily request and enrollment trend.
              </p>
            </div>
            <div className='pt-3'>
              {overviewData?.charts.request_enrollment_trend.points.length ? (
                <ChartContainer className='h-72 w-full' config={chartConfig}>
                  <LineChart data={overviewData.charts.request_enrollment_trend.points}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey='period'
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value: string) =>
                        value
                      }
                    />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(label) =>
                            String(label)
                          }
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
                  No request/enrollment activity in selected period.
                </p>
              )}
            </div>
          </div>
        </div>

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
            {overviewData?.charts.active_workload_by_program.bars.length ? (
              <ChartContainer className='h-80 w-full' config={chartConfig}>
                <BarChart
                  data={overviewData.charts.active_workload_by_program.bars}
                  layout='vertical'
                  margin={{ left: 24, right: 12 }}
                >
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
      </div>
    </div>
  );
}
