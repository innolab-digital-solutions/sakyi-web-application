'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { ENROLLMENTS_OVER_TIME } from '../dashboard-chart-data';

const chartConfig = {
  enrollments: { label: 'Enrollments', color: 'var(--chart-1)' },
  intakes: { label: 'Intakes', color: 'var(--chart-2)' },
  month: { label: 'Month' },
} satisfies ChartConfig;

/**
 * Area chart: enrollments and intakes by month.
 * Answers: Is the program growing? Are intakes keeping pace?
 */
const ParticipationOverTimeChart = () => {
  return (
    <div className="border-border/80 bg-card rounded-lg border p-4 shadow-sm">
      <h3 className="text-foreground text-sm font-semibold">
        Participation over time
      </h3>
      <p className="text-muted-foreground mt-0.5 text-xs">
        Enrollments and intakes by month. See if growth is steady and if intakes
        keep pace.
      </p>
      <ChartContainer
        id="participation-over-time"
        config={chartConfig}
        className="mt-4 h-65 w-full"
      >
        <AreaChart
          data={ENROLLMENTS_OVER_TIME}
          margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="enrollments"
            stackId="a"
            stroke="var(--color-enrollments)"
            fill="var(--color-enrollments)"
            fillOpacity={0.4}
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="intakes"
            stackId="a"
            stroke="var(--color-intakes)"
            fill="var(--color-intakes)"
            fillOpacity={0.4}
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

export default ParticipationOverTimeChart;
