export type NotificationCategory =
  | 'enrollment'
  | 'client'
  | 'program'
  | 'doctor-instruction'
  | 'intake'
  | 'system'
  | 'reminder'
  | 'default';

export interface Notification {
  id: string;
  category: NotificationCategory;
  type: string;
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  href?: string;
  pictureUrl?: string | null;
}
