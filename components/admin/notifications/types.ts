/**
 * Notification types for the admin dashboard.
 * Used to style and categorize notifications (enrollment, client, system, etc.).
 */
export type NotificationType =
  | 'enrollment'
  | 'client'
  | 'program'
  | 'doctor-instruction'
  | 'intake'
  | 'system'
  | 'reminder';

/** Tab filter for notifications: All, System only, or Activity (non-system). */
export type NotificationTabFilter = 'all' | 'system' | 'activity';

/** The three notification tabs: All, System, Activity. */
export const NOTIFICATION_TAB_FILTERS: { value: NotificationTabFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'system', label: 'System' },
  { value: 'activity', label: 'Activity' },
];

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  /** Optional link for "View" action */
  href?: string;
}
