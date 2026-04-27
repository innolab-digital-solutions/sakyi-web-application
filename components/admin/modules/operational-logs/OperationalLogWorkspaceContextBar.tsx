'use client';

import { format, parse } from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { base } from '@/config/api/base';

function formatTargetDateLabel(ymd: string | null | undefined): string {
  if (!ymd?.trim()) return 'Date not set';
  const parsed = parse(ymd.trim(), 'yyyy-MM-dd', new Date());
  if (Number.isNaN(parsed.getTime())) return ymd.trim();
  return format(parsed, 'EEE, dd-MMM-yyyy');
}

function getNameInitials(value: string | null | undefined): string {
  const text = (value ?? '').trim();
  if (!text) return 'NA';
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
}

function resolveClientPictureUrl(
  raw: string | null | undefined,
): string | undefined {
  if (!raw?.trim()) return undefined;
  const v = raw.trim();
  if (v.startsWith('http')) return v;
  return `${base.domainEndpoint}${v}`;
}

export type OperationalLogWorkspaceContextBarProps = {
  clientName: string | null | undefined;
  clientCode: string | null | undefined;
  clientPictureUrl: string | null | undefined;
  programName: string | null | undefined;
  programCode: string | null | undefined;
  cycleNumber: number | null | undefined;
  /** Care plan business code (`AdminCarePlan.code` / `care_plans.code`), not enrollment code. */
  carePlanCode: string | null | undefined;
  /** Care plan care window (same idea as the builder’s Plan Timeline). */
  careWindowStartsOn: string | null | undefined;
  careWindowEndsOn: string | null | undefined;
};

/**
 * Second row of the operational-log workspace: four summary cards matching
 * {@link CarePlanBuilder} (Client, Program, Care Plan, Plan Timeline).
 */
export default function OperationalLogWorkspaceContextBar({
  clientName,
  clientCode,
  clientPictureUrl,
  programName,
  programCode,
  cycleNumber,
  carePlanCode,
  careWindowStartsOn,
  careWindowEndsOn,
}: OperationalLogWorkspaceContextBarProps) {
  const clientAvatarSrc = resolveClientPictureUrl(clientPictureUrl);

  return (
    <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-4'>
      <div className='bg-muted/50 border-border flex min-h-18 flex-col justify-center rounded-md border px-2.5 py-2'>
        <p className='text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wide uppercase'>
          Client
        </p>
        <div className='mt-1 flex min-w-0 items-center gap-2.5'>
          <Avatar
            className='border-border/60 bg-background size-9 border'
            size='default'
          >
            {clientAvatarSrc ? (
              <AvatarImage
                src={clientAvatarSrc}
                alt=''
                className='object-cover'
              />
            ) : null}
            <AvatarFallback className='bg-primary/10 text-primary text-[11px] font-bold'>
              {getNameInitials(clientName ?? null)}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0 flex-1'>
            <p className='text-foreground/90 line-clamp-1 text-[12.5px] font-semibold'>
              {clientName?.trim() || 'Not assigned'}
            </p>
            {clientCode?.trim() ? (
              <p className='text-muted-foreground mt-0.5 truncate text-[11px] font-semibold tabular-nums'>
                {clientCode.trim()}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className='bg-muted/50 border-border flex min-h-18 flex-col justify-center rounded-md border px-2.5 py-2'>
        <p className='text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wide uppercase'>
          Program
        </p>
        <p className='text-foreground/90 line-clamp-2 text-[12.5px] font-semibold'>
          {programName?.trim() || 'Not linked'}
        </p>
        {programCode?.trim() ? (
          <p className='text-muted-foreground mt-0.5 truncate text-[11px] font-semibold tabular-nums'>
            {programCode.trim()}
          </p>
        ) : null}
      </div>

      <div className='bg-muted/50 border-border flex min-h-18 flex-col justify-center rounded-md border px-2.5 py-2'>
        <p className='text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wide uppercase'>
          Care plan
        </p>
        <p className='text-foreground text-[12.5px] font-semibold'>
          Cycle {cycleNumber ?? '—'}
        </p>
        <p className='text-muted-foreground mt-0.5 truncate text-[11px] font-semibold tabular-nums'>
          {carePlanCode?.trim() || 'Not linked'}
        </p>
      </div>

      <div className='bg-muted/50 border-border/60 flex min-h-18 flex-col justify-center rounded-md border px-2.5 py-2'>
        <p className='text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wide uppercase'>
          Plan Timeline
        </p>
        <p className='text-foreground text-[12.5px] font-semibold'>
          Care window
        </p>
        <p className='text-muted-foreground mt-0.5 truncate text-[11px] font-semibold'>
          {careWindowStartsOn
            ? formatTargetDateLabel(careWindowStartsOn)
            : 'Start date not set'}
          {'  '}→{'  '}
          {careWindowEndsOn
            ? formatTargetDateLabel(careWindowEndsOn)
            : 'End date not set'}
        </p>
      </div>
    </div>
  );
}
