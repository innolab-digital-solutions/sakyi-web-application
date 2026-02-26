'use client';

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

import {
  CLIENTS_BY_PROGRAM,
  CLIENTS_BY_PROGRAM_COLORS,
} from '../dashboard-chart-data';

const chartConfig = {
  clients: { label: 'Clients', color: 'var(--chart-1)' },
  wellness: { color: 'var(--chart-1)' },
  nutrition: { color: 'var(--chart-2)' },
  mindful: { color: 'var(--chart-4)' },
  movement: { color: 'var(--chart-5)' },
  weight: { color: 'var(--chart-3)' },
} satisfies ChartConfig;

/**
 * Horizontal bar chart: clients per program.
 * Answers: Where is growth? Which programs have the most clients? (Growth depends on programs.)
 */
const ClientsByProgramBarChart = () => {
  return (
    <div className='border-border/80 bg-card rounded-lg border p-4 shadow-sm'>
      <h3 className='text-foreground text-sm font-semibold'>
        Clients by program
      </h3>
      <p className='text-muted-foreground mt-0.5 text-xs'>
        Which programs have the most clients. Growth is driven by program
        mix—use this to focus support and content.
      </p>
      <ChartContainer
        id='clients-by-program'
        config={chartConfig}
        className='mt-4 h-65 w-full'
      >
        <BarChart
          data={CLIENTS_BY_PROGRAM}
          layout='vertical'
          margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
        >
          <CartesianGrid horizontal={false} strokeDasharray='3 3' />
          <XAxis type='number' tickLine={false} axisLine={false} />
          <YAxis
            type='category'
            dataKey='program'
            tickLine={false}
            axisLine={false}
            width={100}
            tick={{ fontSize: 11 }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey='clients' radius={[0, 4, 4, 0]} maxBarSize={32}>
            {CLIENTS_BY_PROGRAM.map((_, index) => (
              <Cell key={index} fill={CLIENTS_BY_PROGRAM_COLORS[index]} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default ClientsByProgramBarChart;
