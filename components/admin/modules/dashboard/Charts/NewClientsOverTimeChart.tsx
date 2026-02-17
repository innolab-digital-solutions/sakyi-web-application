'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { NEW_CLIENTS_OVER_TIME } from '../dashboard-chart-data';

const chartConfig = {
  newClients: { label: 'New clients', color: 'var(--chart-1)' },
  month: { label: 'Month' },
} satisfies ChartConfig;

/**
 * Bar chart: new client registrations by month.
 * Answers: Is our client base growing? Acquisition trend.
 */
const NewClientsOverTimeChart = () => {
  return (
    <div className="rounded-lg border border-border/80 bg-card p-4 shadow-sm">
      <h3 className="text-foreground text-sm font-semibold">
        New clients over time
      </h3>
      <p className="text-muted-foreground mt-0.5 text-xs">
        New client registrations by month. See if your client base is growing.
      </p>
      <ChartContainer
        id="new-clients-over-time"
        config={chartConfig}
        className="mt-4 h-65 w-full"
      >
        <BarChart
          data={NEW_CLIENTS_OVER_TIME}
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
          <Bar
            dataKey="newClients"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            fill="var(--color-newClients)"
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default NewClientsOverTimeChart;
