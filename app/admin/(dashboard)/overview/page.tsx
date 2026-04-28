'use client';

import { useQuery } from '@tanstack/react-query';
import * as React from 'react';

import OperationalOverviewCard from '@/components/admin/modules/overview/OperationalOverviewCard';
import OverviewKpiGrid from '@/components/admin/modules/overview/OverviewKpiGrid';
import { useAuth } from '@/context/AuthContext';
import { getDashboardOverview } from '@/domains/dashboard-overview/services/admin.service';
import type { DashboardOverviewData } from '@/domains/dashboard-overview/types';

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const formatDate = (): string => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function DashboardPage() {
  const { user } = useAuth();

  const overviewQuery = useQuery({
    queryKey: ['admin-dashboard-overview'],
    queryFn: () => getDashboardOverview(),
    refetchInterval: 1000 * 90,
    refetchOnWindowFocus: true,
  });

  const overviewData: DashboardOverviewData | null =
    overviewQuery.data?.status === 'success' ? overviewQuery.data.data : null;
  const overviewError =
    overviewQuery.data?.status === 'error' ? overviewQuery.data.message : null;

  const generatedAtText = React.useMemo(() => {
    if (!overviewData?.meta?.generated_at) {
      return 'Unknown';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(overviewData.meta.generated_at));
  }, [overviewData]);

  return (
    <div className='space-y-5'>
      <div className='flex flex-col space-y-1'>
        <p className='text-muted-foreground text-xs font-semibold'>
          {formatDate()}
        </p>
        <h1 className='text-foreground text-md font-bold'>
          {getGreeting()}! {user?.name ?? 'User'}
        </h1>
      </div>

      <OverviewKpiGrid
        isLoading={overviewQuery.isLoading}
        overviewData={overviewData}
      />

      <OperationalOverviewCard
        overviewError={overviewError}
        generatedAtText={generatedAtText}
        overviewData={overviewData}
      />
    </div>
  );
}
