'use client';

import {
  Bell,
  FileText,
  type LucideIcon,
  Package,
  Stethoscope,
  User,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils/styles';

import type { Notification, NotificationCategory } from './types';

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const TYPE_CONFIG: Record<
  NotificationCategory,
  { icon: LucideIcon; bgClass: string; iconClass: string }
> = {
  enrollment: {
    icon: UserPlus,
    bgClass: 'bg-[#0c96c4]/10',
    iconClass: 'text-[#0c96c4]',
  },
  client: {
    icon: User,
    bgClass: 'bg-emerald-500/10',
    iconClass: 'text-emerald-600',
  },
  program: {
    icon: Package,
    bgClass: 'bg-violet-500/10',
    iconClass: 'text-violet-600',
  },
  'doctor-instruction': {
    icon: Stethoscope,
    bgClass: 'bg-amber-500/10',
    iconClass: 'text-amber-600',
  },
  intake: {
    icon: FileText,
    bgClass: 'bg-sky-500/10',
    iconClass: 'text-sky-600',
  },
  system: {
    icon: Bell,
    bgClass: 'bg-slate-500/10',
    iconClass: 'text-slate-600',
  },
  reminder: {
    icon: Bell,
    bgClass: 'bg-rose-500/10',
    iconClass: 'text-rose-600',
  },
  default: {
    icon: Bell,
    bgClass: 'bg-slate-500/10',
    iconClass: 'text-slate-600',
  },
};

interface NotificationCardProps {
  notification: Notification;
  className?: string;
  onOpen?: (notification: Notification) => void;
}

/**
 * Renders a single notification card with icon, title, message, and time.
 * Aligns with the health and wellness admin dashboard styling.
 */
export function NotificationCard({
  notification,
  className,
  onOpen,
}: NotificationCardProps) {
  const config = TYPE_CONFIG[notification.category];
  const Icon = config.icon;

  const content = (
    <>
      <div
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-lg',
          config.bgClass,
          config.iconClass,
        )}
      >
        <Icon className='size-5' />
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-foreground text-sm leading-tight font-semibold'>
          {notification.title}
        </p>
        <p className='text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-snug'>
          {notification.message}
        </p>
        <p className='text-muted-foreground mt-1.5 text-[11px]'>
          {formatTimeAgo(notification.createdAt)}
        </p>
      </div>
      {!notification.read && (
        <span
          className='size-2 shrink-0 rounded-full bg-[#0c96c4]'
          aria-hidden
        />
      )}
    </>
  );

  const cardClass = cn(
    'border-border/80 bg-card flex gap-3 rounded-lg border p-3 text-left shadow-sm transition-colors hover:bg-muted/50',
    !notification.read && 'bg-muted/30',
    className,
  );

  if (notification.href) {
    return (
      <Link
        href={notification.href}
        className={cardClass}
        onClick={() => onOpen?.(notification)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type='button'
      className={cardClass}
      onClick={() => onOpen?.(notification)}
    >
      {content}
    </button>
  );
}
