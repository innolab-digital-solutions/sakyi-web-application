import { StatCard } from '@/components/admin/dashboard/StatCard';
import { DashboardCharts } from '@/components/admin/dashboard/DashboardCharts';

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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Clients"
            value="1,248"
            trend={{ value: 12, direction: 'up', label: 'vs last month' }}
            iconName="UserSquare2"
            accentClass="bg-green-500"
          />
          <StatCard
            title="Active Enrollments"
            value="342"
            trend={{ value: 5, direction: 'up' }}
            subtitle="Currently in programs"
            iconName="ClipboardCheck"
            accentClass="bg-blue-500"
          />
          <StatCard
            title="Programs"
            value="18"
            subtitle="Nutrition & movement"
            iconName="FolderKanban"
            accentClass="bg-yellow-500"
          />
          <StatCard
            title="Pending Intakes"
            value="23"
            subtitle="Awaiting review"
            iconName="ListChecks"
            iconBgClass="bg-amber-500/10"
            iconClass="text-amber-600"
            accentClass="bg-red-500"
          />
        </div>
      </section>

      <section aria-label="Charts">
        <DashboardCharts />
      </section>
    </div>
  );
}
