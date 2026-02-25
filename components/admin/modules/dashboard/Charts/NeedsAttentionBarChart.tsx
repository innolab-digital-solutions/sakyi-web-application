'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

import { NEEDS_ATTENTION } from '../dashboard-chart-data';

const chartConfig = {
  count: { label: 'Count', color: 'var(--chart-5)' },
  item: { label: 'Item' },
} satisfies ChartConfig;

/**
 * Horizontal bar chart: items needing admin action (pending intakes, doctor instructions, new enrollments).
 * Answers: What needs my action?
 */
const NeedsAttentionBarChart = () => {
  return (
    <div className='border-border/80 bg-card rounded-lg border p-4 shadow-sm'>
      <h3 className='text-foreground text-sm font-semibold'>Needs attention</h3>
      <p className='text-muted-foreground mt-0.5 text-xs'>
        Items that need your action: pending intakes, doctor instructions, new
        enrollments this week.
      </p>
      <ChartContainer
        id='needs-attention'
        config={chartConfig}
        className='mt-4 h-65 w-full'
      >
        <BarChart
          data={NEEDS_ATTENTION}
          layout='vertical'
          margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
        >
          <CartesianGrid horizontal={false} strokeDasharray='3 3' />
          <XAxis type='number' tickLine={false} axisLine={false} />
          <YAxis
            type='category'
            dataKey='item'
            tickLine={false}
            axisLine={false}
            width={140}
            tick={{ fontSize: 11 }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey='count'
            radius={[0, 4, 4, 0]}
            maxBarSize={32}
            fill='var(--color-count)'
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default NeedsAttentionBarChart;
