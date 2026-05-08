'use client';

import {
  Bell,
  ClipboardPlus,
  FileText,
  type LucideIcon,
  Package,
  Stethoscope,
  User,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';

import { Checkbox } from '@/components/ui/checkbox';
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

const TYPE_EVENT_CONFIG: Partial<
  Record<
    Notification['type'],
    { icon: LucideIcon; bgClass: string; iconClass: string }
  >
> = {
  'enrollment.request.submitted': {
    icon: ClipboardPlus,
    bgClass: 'bg-[#0c96c4]/12',
    iconClass: 'text-[#0c96c4]',
  },
};

interface NotificationCardProps {
  notification: Notification;
  className?: string;
  onOpen?: (notification: Notification) => void;
  selectMode?: boolean;
  selected?: boolean;
  onSelectChange?: (notification: Notification, selected: boolean) => void;
}

/**
 * Renders a single notification card with icon, title, message, and time.
 * Aligns with the health and wellness admin dashboard styling.
 */
export function NotificationCard({
  notification,
  className,
  onOpen,
  selectMode = false,
  selected = false,
  onSelectChange,
}: NotificationCardProps) {
  const config =
    TYPE_EVENT_CONFIG[notification.type] ?? TYPE_CONFIG[notification.category];
  const Icon = config.icon;

  const content = (
    <>
      <div className='flex items-start pt-0.5'>
        {selectMode ? (
          <Checkbox
            checked={selected}
            onCheckedChange={(value) =>
              onSelectChange?.(notification, value === true)
            }
            onClick={(event) => event.stopPropagation()}
            aria-label={`Select notification: ${notification.title}`}
          />
        ) : (
          <span className='inline-block size-4.5' aria-hidden />
        )}
      </div>
      <div
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-md',
          config.bgClass,
          config.iconClass,
        )}
      >
        <Icon className='size-4' />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between gap-3'>
          <p className='text-foreground text-[13px] leading-tight font-semibold'>
            {notification.title}
          </p>
          <div className='flex shrink-0 items-center gap-1.5'>
            {!notification.read && (
              <span
                className='size-1.5 animate-pulse rounded-full bg-[#0c96c4] shadow-[0_0_0_4px_rgba(12,150,196,0.14)]'
                aria-hidden
              />
            )}
            <p className='text-foreground/70 text-[11px] font-medium'>
              {formatTimeAgo(notification.createdAt)}
            </p>
          </div>
        </div>
        <p className='text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-snug'>
          {notification.message}
        </p>
      </div>
    </>
  );

  const cardClass = cn(
    'border-border bg-card flex gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/30',
    !notification.read && 'border-[#0c96c4]/30 bg-[#0c96c4]/[0.04]',
    selectMode && 'cursor-pointer',
    selectMode && selected && 'border-primary/50 bg-primary/5',
    className,
  );

  if (selectMode) {
    return (
      <div
        role='button'
        tabIndex={0}
        className={cardClass}
        onClick={() => onSelectChange?.(notification, !selected)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelectChange?.(notification, !selected);
          }
        }}
      >
        {content}
      </div>
    );
  }

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
