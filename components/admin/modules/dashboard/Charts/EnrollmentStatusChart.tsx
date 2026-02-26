'use client';

import { Cell, Pie, PieChart } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

import { ENROLLMENT_STATUS_DISTRIBUTION } from '../dashboard-chart-data';

const chartConfig = {
  active: { label: 'Active', color: 'var(--chart-2)' },
  completed: { label: 'Completed', color: 'var(--chart-1)' },
  hold: { label: 'On hold', color: 'var(--chart-5)' },
  pending: { label: 'Pending', color: 'var(--muted-foreground)' },
} satisfies ChartConfig;

/**
 * Donut chart: enrollment status distribution (active, completed, on hold, pending).
 * Answers: What's the pipeline health at a glance?
 */
const EnrollmentStatusChart = () => {
  return (
    <div className='border-border/80 bg-card rounded-lg border p-4 shadow-sm'>
      <h3 className='text-foreground text-sm font-semibold'>
        Enrollment status
      </h3>
      <p className='text-muted-foreground mt-0.5 text-xs'>
        Active, completed, on hold, and pending. Quick view of pipeline health.
      </p>
      <ChartContainer
        id='enrollment-status'
        config={chartConfig}
        className='mx-auto mt-4 h-65 w-full max-w-[320px]'
      >
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Pie
            data={ENROLLMENT_STATUS_DISTRIBUTION}
            dataKey='value'
            nameKey='name'
            cx='50%'
            cy='50%'
            innerRadius={56}
            strokeWidth={2}
            paddingAngle={2}
          >
            {ENROLLMENT_STATUS_DISTRIBUTION.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
};

export default EnrollmentStatusChart;
