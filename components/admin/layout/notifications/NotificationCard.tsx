'use client';

import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils/styles';

import type { Notification } from './types';

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

function getInitials(name: string, count = 2): string {
  const normalized = name.trim();
  if (!normalized) return '';

  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, count).toUpperCase();
  }

  return words
    .slice(0, count)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();
}

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
  const isSystemLogoAvatar = notification.pictureUrl === '/images/logo-3d.png';
  const fallbackLabel =
    getInitials(notification.clientName?.trim() ?? '', 2) || 'UN';

  const content = (
    <>
      <Avatar
        size='lg'
        className='border-border/80 mt-0.5 shrink-0 rounded-md border'
        aria-hidden
      >
        {notification.pictureUrl?.trim() ? (
          <AvatarImage
            src={notification.pictureUrl}
            alt=''
            className={cn(isSystemLogoAvatar && 'scale-[0.78] object-contain')}
          />
        ) : null}
        <AvatarFallback className='bg-muted text-muted-foreground rounded-md text-xs font-semibold'>
          {fallbackLabel}
        </AvatarFallback>
      </Avatar>
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
    'flex gap-3 text-left transition-colors',
    selectMode
      ? 'border-border bg-card cursor-pointer rounded-lg border p-3'
      : 'border-border/90 w-full rounded-none border-x-0 border-b px-1 py-3 last:border-b-0 hover:bg-muted/25',
    selectMode &&
      selected &&
      'border-primary bg-primary/10 shadow-primary/15 ring-primary/20 shadow-sm ring-1',
    className,
  );

  if (selectMode) {
    return (
      <button
        type='button'
        role='button'
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
      </button>
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
