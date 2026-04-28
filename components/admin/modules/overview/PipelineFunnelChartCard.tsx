'use client';

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { DashboardPipelineStage } from '@/domains/dashboard-overview/types';

const chartConfig = {
  count: { label: 'Count', color: 'var(--chart-1)' },
} as const;

type PipelineFunnelChartCardProps = {
  stages: DashboardPipelineStage[];
};

export default function PipelineFunnelChartCard({
  stages,
}: PipelineFunnelChartCardProps) {
  return (
    <div className='border-border bg-background rounded-md border p-4 md:p-5'>
      <div className='space-y-1.5 mb-3'>
        <h3 className='text-foreground text-[13.5px]! font-semibold'>
          Enrollment Pipeline Funnel
        </h3>
        <p className='text-muted-foreground text-xs font-medium'>
          Compare stage-by-stage conversion volume to identify pipeline
          drop-offs and prioritize operational follow-up.
        </p>
      </div>
      <div className='pt-3'>
        {stages.length ? (
          <ChartContainer className='ml-1 h-72 w-[calc(100%+0.75rem)]' config={chartConfig}>
            <BarChart
              data={stages}
              margin={{ top: 8, right: 4, bottom: 0, left: -8 }}
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
              <Bar dataKey='count' fill='var(--color-count)' radius={10} barSize={72}>
                {stages.map((entry) => (
                  <Cell key={entry.key} fill='var(--color-count)' />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <p className='text-muted-foreground text-sm'>
            No pipeline activity yet.
          </p>
        )}
      </div>
    </div>
  );
}
