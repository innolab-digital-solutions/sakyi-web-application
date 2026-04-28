'use client';

import {
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  ContactRound,
  FileClock,
  FileSignature,
  UsersRound,
  Users,
} from 'lucide-react';

import type { DashboardOverviewData } from '@/domains/dashboard-overview/types';

import { KpiCard, KpiCardSkeleton } from './KpiCard';

type OverviewKpiGridProps = {
  isLoading: boolean;
  overviewData: DashboardOverviewData | null;
};

export default function OverviewKpiGrid({
  isLoading,
  overviewData,
}: OverviewKpiGridProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
      {isLoading || !overviewData ? (
        Array.from({ length: 8 }).map((_, index) => (
          <KpiCardSkeleton key={index} />
        ))
      ) : (
        <>
          <KpiCard
            title='Pending Enrollment Requests'
            value={overviewData.kpis.pending_enrollment_requests}
            icon={ClipboardList}
            description='New enrollment requests waiting for admin review and initial triage.'
            tone='blue'
          />
          <KpiCard
            title='Care Plans Needing Attention'
            value={overviewData.kpis.care_plans_needing_attention}
            icon={AlertTriangle}
            description='Active care plans flagged for follow-up, correction, or overdue updates.'
            tone='amber'
          />
          <KpiCard
            title='Contracts Waiting Signature'
            value={overviewData.kpis.contracts_waiting_signature}
            icon={FileSignature}
            description='Enrollment contracts awaiting signature before onboarding can proceed.'
            tone='indigo'
          />
          <KpiCard
            title='Active Enrollments'
            value={overviewData.kpis.active_enrollments}
            icon={Users}
            description='Enrollments currently active and being delivered across all programs.'
            tone='cyan'
          />
          <KpiCard
            title='Reports Awaiting Publish'
            value={overviewData.kpis.reports_awaiting_publish}
            icon={FileClock}
            description='Completed reports waiting for final review and publish approval.'
            tone='violet'
          />
          <KpiCard
            title='Enrollments Starting Soon'
            value={overviewData.kpis.scheduled_enrollments_starting_soon}
            icon={CalendarClock}
            description='Scheduled enrollments approaching their confirmed program start date.'
            tone='rose'
          />
          <KpiCard
            title='Total Users'
            value={overviewData.kpis.total_users}
            icon={UsersRound}
            description='All registered accounts in the platform, including admins, staff, and clients.'
            tone='sky'
          />
          <KpiCard
            title='Total Clients'
            value={overviewData.kpis.total_clients}
            icon={ContactRound}
            description='Users marked as clients who have enrolled in at least one program.'
            tone='emerald'
          />
        </>
      )}
    </div>
  );
}
