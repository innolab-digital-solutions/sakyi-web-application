import { DASHBOARD_STATS } from '@/config/dashboard-stats';
import StatsCard from '@/components/admin/modules/dashboard/StatsCard';
import { DashboardCharts } from '@/components/admin/modules/dashboard/DashboardCharts';

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <DashboardCharts />
      </section>
    </div>
  );
}
