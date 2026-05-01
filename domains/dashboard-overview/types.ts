export type DashboardOverviewKpis = {
  pending_enrollment_requests: number;
  contracts_waiting_signature: number;
  active_enrollments: number;
  care_plans_needing_attention: number;
  reports_awaiting_publish: number;
  total_users: number;
  scheduled_enrollments_starting_soon: number;
  total_clients: number;
};

export type DashboardPipelineStage = {
  key: string;
  label: string;
  count: number;
};

export type DashboardTrendPoint = {
  period: string;
  requests: number;
  enrollments: number;
};

export type DashboardProgramWorkload = {
  program_id: number;
  program_code: string;
  program_title: string;
  active_enrollments: number;
};

export type DashboardOverviewCharts = {
  pipeline_funnel: {
    stages: DashboardPipelineStage[];
  };
  request_enrollment_trend: {
    points: DashboardTrendPoint[];
  };
  active_workload_by_program: {
    bars: DashboardProgramWorkload[];
  };
};

export type DashboardOverviewMeta = {
  generated_at: string;
};

export type DashboardOverviewData = {
  kpis: DashboardOverviewKpis;
  charts: DashboardOverviewCharts;
  meta: DashboardOverviewMeta;
};
