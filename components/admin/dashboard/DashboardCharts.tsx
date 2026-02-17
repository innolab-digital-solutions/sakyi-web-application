'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  ENROLLMENTS_OVER_TIME,
  CLIENTS_BY_PROGRAM,
  CLIENTS_BY_PROGRAM_COLORS,
  ENROLLMENT_STATUS_DISTRIBUTION,
} from './dashboard-chart-data';

const enrollmentsChartConfig = {
  enrollments: {
    label: 'Enrollments',
    color: '#0c96c4',
  },
  intakes: {
    label: 'Intakes',
    color: '#10b981',
  },
  month: {
    label: 'Month',
  },
} satisfies ChartConfig;

const programsChartConfig = {
  clients: {
    label: 'Clients',
    color: '#0c96c4',
  },
  wellness: { color: '#0c96c4' },
  nutrition: { color: '#10b981' },
  mindful: { color: '#8b5cf6' },
  movement: { color: '#f59e0b' },
  weight: { color: '#ec4899' },
} satisfies ChartConfig;

const statusChartConfig = {
  active: { label: 'Active', color: '#10b981' },
  completed: { label: 'Completed', color: '#0c96c4' },
  hold: { label: 'On hold', color: '#f59e0b' },
  pending: { label: 'Pending', color: '#94a3b8' },
} satisfies ChartConfig;

/**
 * Responsive dashboard charts for the health and wellness admin: area, bar, and pie.
 */
export function DashboardCharts() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Enrollments & intakes over time (area chart) */}
      <div className="rounded-lg border border-border/80 bg-card p-4 shadow-sm">
        <h3 className="text-foreground mb-4 text-sm font-semibold">
          Enrollments & intakes
        </h3>
        <ChartContainer
          id="enrollments-over-time"
          config={enrollmentsChartConfig}
          className="h-65 w-full"
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

      {/* Clients by program (bar chart) */}
      <div className="rounded-lg border border-border/80 bg-card p-4 shadow-sm">
        <h3 className="text-foreground mb-4 text-sm font-semibold">
          Clients by program
        </h3>
        <ChartContainer
          id="clients-by-program"
          config={programsChartConfig}
          className="h-65 w-full"
        >
          <BarChart
            data={CLIENTS_BY_PROGRAM}
            layout="vertical"
            margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="program"
              tickLine={false}
              axisLine={false}
              width={100}
              tick={{ fontSize: 11 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="clients" radius={[0, 4, 4, 0]} maxBarSize={32}>
              {CLIENTS_BY_PROGRAM.map((_, index) => (
                <Cell
                  key={index}
                  fill={CLIENTS_BY_PROGRAM_COLORS[index]}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      {/* Enrollment status (pie chart) - full width on large so it sits below or in grid */}
      <div className="rounded-lg border border-border/80 bg-card p-4 shadow-sm lg:col-span-2">
        <h3 className="text-foreground mb-4 text-sm font-semibold">
          Enrollment status
        </h3>
        <ChartContainer
          id="enrollment-status"
          config={statusChartConfig}
          className="mx-auto h-65 w-full max-w-[320px]"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={ENROLLMENT_STATUS_DISTRIBUTION}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
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
    </div>
  );
}
