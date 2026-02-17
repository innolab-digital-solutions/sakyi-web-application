import { DASHBOARD_STATS } from '@/config/dashboard-stats';
import StatsCard from '@/components/admin/modules/dashboard/StatsCard';
import {
  ClientsByProgramBarChart,
  EnrollmentStatusChart,
  NeedsAttentionBarChart,
  NewClientsOverTimeChart,
  ParticipationOverTimeChart,
} from '@/components/admin/modules/dashboard/Charts';

const CHART_LAYOUT: { id: string; span?: 2 }[] = [
  { id: 'participation' },
  { id: 'new-clients' },
  { id: 'enrollment-status' },
  { id: 'needs-attention' },
  { id: 'clients-by-program', span: 2 },
];

const CHART_COMPONENTS = {
  participation: ParticipationOverTimeChart,
  'new-clients': NewClientsOverTimeChart,
  'clients-by-program': ClientsByProgramBarChart,
  'enrollment-status': EnrollmentStatusChart,
  'needs-attention': NeedsAttentionBarChart,
} as const;

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1">
        <p className="text-muted-foreground text-xs font-semibold">
          Thursday, 16th February 2026
        </p>
        <h1 className="text-foreground text-md font-bold">
          Good Evening! Aung Thu Zaw
        </h1>
      </div>

      <section aria-label="Dashboard overview">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {DASHBOARD_STATS.map((stat) => (
            <StatsCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              trend={stat.trend}
              iconName={stat.iconName}
              iconBgClass={stat.iconBgClass}
              iconClass={stat.iconClass}
            />
          ))}
        </div>
      </section>

      <section aria-label="Charts">
        <div className="grid gap-6 lg:grid-cols-2">
          {CHART_LAYOUT.map(({ id, span }) => {
            const Chart = CHART_COMPONENTS[id as keyof typeof CHART_COMPONENTS];
            return (
              <div
                key={id}
                className={span === 2 ? 'lg:col-span-2' : undefined}
              >
                <Chart />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
