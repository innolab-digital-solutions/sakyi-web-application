export interface NotificationData {
  type?: string;
  title?: string;
  message?: string;
  action_url?: string;
  meta?: Record<string, unknown>;
}

export interface BackendNotification {
  id: string;
  type: string;
  read_at: string | null;
  created_at: string;
  data: NotificationData;
}
