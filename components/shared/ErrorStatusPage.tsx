import {
  House,
  LayoutDashboard,
  LifeBuoy,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import type { ErrorPresentation } from '@/lib/errors/http-status';
import { cn } from '@/lib/utils/styles';

/** Link navigation action (used in primary or outline slot). */
export type ErrorPageLinkAction = {
  kind: 'link';
  href: string;
  label: string;
};

/** Button action, e.g. retry from an error boundary (used in primary or outline slot). */
export type ErrorPageButtonAction = {
  kind: 'button';
  onClick: () => void;
  label: string;
};

export type ErrorPageAction = ErrorPageLinkAction | ErrorPageButtonAction;

type ErrorStatusPageProps = {
  presentation: ErrorPresentation;
  note?: ReactNode;
  /**
   * Main CTA (default / solid button). Use the error boundary `reset` callback here
   * when you want “Try again” to be the primary action. At most two actions total
   * with `outline`.
   */
  primary: ErrorPageAction;
  /** Secondary CTA (outline), e.g. go home or admin overview. */
  outline?: ErrorPageAction;
  className?: string;
};

const primaryButtonClass =
  'h-11 shrink-0 gap-1.5 rounded-md px-3 text-[13px]! font-semibold';
const outlineButtonClass =
  'bg-background hover:bg-muted h-11 gap-1.5 rounded-md border-neutral-300 px-3.5 text-[13px]! font-semibold';

function iconForAction(action: ErrorPageAction): LucideIcon {
  if (action.kind === 'button') {
    return RotateCcw;
  }
  const { href } = action;
  if (href === '/' || href === '') {
    return House;
  }
  if (href.startsWith('/admin')) {
    return LayoutDashboard;
  }
  if (href.includes('contact')) {
    return LifeBuoy;
  }
  return House;
}

function ErrorPageActionControl({
  action,
  slot,
}: {
  action: ErrorPageAction;
  slot: 'primary' | 'outline';
}) {
  const Icon = iconForAction(action);
  const isOutline = slot === 'outline';

  if (action.kind === 'link') {
    return (
      <Button
        asChild
        variant={isOutline ? 'outline' : 'default'}
        className={isOutline ? outlineButtonClass : primaryButtonClass}
      >
        <Link href={action.href}>
          <Icon className='size-3.5' />
          {action.label}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      type='button'
      variant={isOutline ? 'outline' : 'default'}
      className={isOutline ? outlineButtonClass : primaryButtonClass}
      onClick={action.onClick}
    >
      <Icon className='size-3.5' />
      {action.label}
    </Button>
  );
}

export default function ErrorStatusPage({
  presentation,
  note,
  primary,
  outline,
  className,
}: ErrorStatusPageProps) {
  return (
    <section
      className={cn(
        'flex min-h-screen items-center justify-center bg-white px-4 py-8 sm:px-8 lg:px-12',
        className,
      )}
    >
      <div className='grid w-full max-w-6xl items-center gap-8 md:grid-cols-2 md:gap-12'>
        <div className='order-2 mx-auto w-full max-w-xl space-y-4 text-center md:order-1 md:mx-0 md:max-w-lg md:text-left'>
          <p className='text-primary text-xs font-semibold tracking-[0.22em] uppercase sm:text-sm'>
            Error {presentation.code}
          </p>
          <h1 className='text-foreground text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl'>
            {presentation.title}
          </h1>
          <p className='text-muted-foreground text-sm leading-relaxed sm:text-base lg:max-w-[56ch]'>
            {presentation.description}
          </p>
          {note ? (
            <div className='text-muted-foreground text-xs'>{note}</div>
          ) : null}
          <div className='flex flex-wrap items-center justify-center gap-2.5 pt-2 sm:gap-3 md:justify-start'>
            <ErrorPageActionControl action={primary} slot='primary' />
            {outline ? (
              <ErrorPageActionControl action={outline} slot='outline' />
            ) : null}
          </div>
        </div>
        <div className='order-1 flex justify-center md:order-2 md:justify-end'>
          <Image
            src={presentation.imageSrc}
            alt={`${presentation.code} ${presentation.title}`}
            width={420}
            height={420}
            priority
            className='h-auto w-full max-w-72.5 object-contain sm:max-w-90 md:max-w-102.5 lg:max-w-115'
          />
        </div>
      </div>
    </section>
  );
}
