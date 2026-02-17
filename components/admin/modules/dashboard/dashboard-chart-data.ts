/**
 * Dashboard chart data for the health and wellness admin.
 *
 * Chart strategy (what admins need to see):
 *
 * 1. Participation over time (area)
 *    → "Is the program growing? Are intakes keeping pace with enrollments?"
 *
 * 2. Clients by program (bar)
 *    → "Where are people? Which programs need focus or support?"
 *
 * 3. Enrollment status (donut)
 *    → "What's the pipeline? Active vs completed vs on hold vs pending."
 *
 * 4. Needs attention (bar)
 *    → "What needs my action? Pending intakes, doctor instructions, new enrollments this week."
 *
 * 5. New clients over time (bar)
 *    → "Is our client base growing? New registrations by month."
 *
 * Replace with API-driven data in production.
 */

/** Monthly enrollments and intakes – trend and backlog sense. */
export const ENROLLMENTS_OVER_TIME = [
  { month: 'Sep', enrollments: 42, intakes: 38 },
  { month: 'Oct', enrollments: 58, intakes: 52 },
  { month: 'Nov', enrollments: 61, intakes: 58 },
  { month: 'Dec', enrollments: 78, intakes: 71 },
  { month: 'Jan', enrollments: 85, intakes: 82 },
  { month: 'Feb', enrollments: 92, intakes: 88 },
];

/** Clients per program – where participation sits. */
export const CLIENTS_BY_PROGRAM = [
  { program: '12-Week Wellness', clients: 156 },
  { program: 'Nutrition Basics', clients: 124 },
  { program: 'Mindful Eating', clients: 98 },
  { program: 'Movement & Stretch', clients: 87 },
  { program: 'Weight Management', clients: 76 },
];

export const CLIENTS_BY_PROGRAM_COLORS = [
  'var(--color-wellness)',
  'var(--color-nutrition)',
  'var(--color-mindful)',
  'var(--color-movement)',
  'var(--color-weight)',
];

/** Enrollment pipeline: active, completed, on hold, pending. */
export const ENROLLMENT_STATUS_DISTRIBUTION = [
  { name: 'Active', value: 342, fill: 'var(--color-active)' },
  { name: 'Completed', value: 218, fill: 'var(--color-completed)' },
  { name: 'On hold', value: 45, fill: 'var(--color-hold)' },
  { name: 'Pending', value: 23, fill: 'var(--color-pending)' },
];

/** Items needing admin action – workload at a glance. */
export const NEEDS_ATTENTION = [
  { item: 'Pending intakes', count: 23 },
  { item: 'Doctor instructions', count: 14 },
  { item: 'New enrollments (this week)', count: 12 },
];

/** New client registrations by month – acquisition trend. */
export const NEW_CLIENTS_OVER_TIME = [
  { month: 'Sep', newClients: 38 },
  { month: 'Oct', newClients: 52 },
  { month: 'Nov', newClients: 48 },
  { month: 'Dec', newClients: 61 },
  { month: 'Jan', newClients: 67 },
  { month: 'Feb', newClients: 74 },
];
