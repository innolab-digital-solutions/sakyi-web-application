/**
 * Mock chart data for the health and wellness admin dashboard.
 * Replace with API-driven data in production.
 */

export const ENROLLMENTS_OVER_TIME = [
  { month: 'Sep', enrollments: 42, intakes: 38 },
  { month: 'Oct', enrollments: 58, intakes: 52 },
  { month: 'Nov', enrollments: 61, intakes: 58 },
  { month: 'Dec', enrollments: 78, intakes: 71 },
  { month: 'Jan', enrollments: 85, intakes: 82 },
  { month: 'Feb', enrollments: 92, intakes: 88 },
];

export const CLIENTS_BY_PROGRAM = [
  { program: '12-Week Wellness', clients: 156 },
  { program: 'Nutrition Basics', clients: 124 },
  { program: 'Mindful Eating', clients: 98 },
  { program: 'Movement & Stretch', clients: 87 },
  { program: 'Weight Management', clients: 76 },
];

/** Colors for clients-by-program bars (match programsChartConfig keys). */
export const CLIENTS_BY_PROGRAM_COLORS = [
  'var(--color-wellness)',
  'var(--color-nutrition)',
  'var(--color-mindful)',
  'var(--color-movement)',
  'var(--color-weight)',
];

export const ENROLLMENT_STATUS_DISTRIBUTION = [
  { name: 'Active', value: 342, fill: 'var(--color-active)' },
  { name: 'Completed', value: 218, fill: 'var(--color-completed)' },
  { name: 'On hold', value: 45, fill: 'var(--color-hold)' },
  { name: 'Pending', value: 23, fill: 'var(--color-pending)' },
];
