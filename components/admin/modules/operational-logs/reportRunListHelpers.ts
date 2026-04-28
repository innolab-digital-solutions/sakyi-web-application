import { format, parseISO } from 'date-fns';
import {
  ActivityIcon,
  ArchiveIcon,
  CheckCircle2Icon,
  FileTextIcon,
  LockIcon,
  SendIcon,
} from 'lucide-react';
import { type ComponentType } from 'react';

import { base } from '@/config/api/base';
import { ROUTES } from '@/config/routes';

/** Operational log list (`draft` | `in_progress` | `locked`). */
export type OperationalLogStatusKey = 'draft' | 'in_progress' | 'locked';

export const OPERATIONAL_LOG_STATUS_STYLES: Record<
  OperationalLogStatusKey,
  {
    icon: ComponentType<{ className?: string }>;
    className: string;
    label: string;
  }
> = {
  /**
   * Tokens match care plan + enrollment list badges: `border-{hue}-300/80 bg-{hue}-50 text-{hue}-800` (+ dark pair).
   * Draft = amber + file; in progress = cyan + activity (same as “active”); locked = violet + lock (read-only / sealed).
   */
  draft: {
    icon: FileTextIcon,
    className:
      'border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
    label: 'Draft',
  },
  in_progress: {
    icon: ActivityIcon,
    className:
      'border-cyan-300/80 bg-cyan-50 text-cyan-800 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-200',
    label: 'In progress',
  },
  locked: {
    icon: LockIcon,
    className:
      'border-violet-300/80 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200',
    label: 'Locked',
  },
};

/** Client report list (`in_review` | `published` | `archived`). */
export type ClientReportStatusKey = 'in_review' | 'published' | 'archived';

export const CLIENT_REPORT_STATUS_STYLES: Record<
  ClientReportStatusKey,
  {
    icon: ComponentType<{ className?: string }>;
    className: string;
    label: string;
  }
> = {
  in_review: {
    icon: SendIcon,
    className:
      'border-sky-300/80 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200',
    label: 'In review',
  },
  published: {
    icon: CheckCircle2Icon,
    className:
      'border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
    label: 'Published',
  },
  archived: {
    icon: ArchiveIcon,
    className: 'border-border bg-muted/70 text-foreground dark:bg-muted/50',
    label: 'Archived',
  },
};

export const UNKNOWN_STATUS_BADGE_CLASS =
  'border-border bg-muted/60 text-foreground inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold';

export function resolveClientPictureUrl(
  raw: string | null | undefined,
): string | undefined {
  if (!raw?.trim()) return undefined;
  const value = raw.trim();
  if (value.startsWith('http')) return value;
  return `${base.domainEndpoint}${value}`;
}

function formatOneDay(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  try {
    return format(parseISO(iso.trim()), 'dd-MMMM-yyyy');
  } catch {
    return iso.trim();
  }
}

export function formatPeriodRange(
  start: string | null | undefined,
  end: string | null | undefined,
): string {
  const a = start?.trim() ? formatOneDay(start) : null;
  const b = end?.trim() ? formatOneDay(end) : null;
  if (a && b) return `${a} → ${b}`;
  if (a) return a;
  if (b) return b;
  return '—';
}

export function formatDateTimeCell(
  iso: string | null | undefined,
): string | null {
  if (!iso?.trim()) return null;
  try {
    return format(parseISO(iso.trim()), 'dd-MMM-yyyy');
  } catch {
    return iso.trim();
  }
}

export function normalizeOperationalLogStatus(
  value: string | null | undefined,
): OperationalLogStatusKey | null {
  const s = (value ?? '').trim().toLowerCase();
  if (s === 'draft' || s === 'in_progress' || s === 'locked') return s;
  return null;
}

export function normalizeClientReportStatus(
  value: string | null | undefined,
): ClientReportStatusKey | null {
  const s = (value ?? '').trim().toLowerCase();
  if (s === 'in_review' || s === 'published' || s === 'archived') return s;
  return null;
}

/**
 * Operational logs workspace: `GET` report-workspace with no query (care
 * plan’s single operational log / period on the server). Ids are kept for
 * call-site context only.
 */
export function buildReportWorkspaceHref(
  carePlanId: number,
  _reportRunId: number,
): string {
  return ROUTES.ADMIN.MODULES.OPERATIONAL_LOGS.WORKSPACE(String(carePlanId));
}

/** Same as {@link buildReportWorkspaceHref} — list rows link to a clean path. */
export function buildOperationalLogWorkspaceHref(
  carePlanId: number,
  _operationalLogId: number,
): string {
  return ROUTES.ADMIN.MODULES.OPERATIONAL_LOGS.WORKSPACE(String(carePlanId));
}
