import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { House, LifeBuoy, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/styles';
import type { ErrorPresentation } from '@/lib/errors/http-status';

type ErrorStatusPageProps = {
  presentation: ErrorPresentation;
  note?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
};

export default function ErrorStatusPage({
  presentation,
  note,
  onRetry,
  retryLabel = 'Try again',
  primaryHref = '/',
  primaryLabel = 'Go home',
  secondaryHref,
  secondaryLabel,
  className,
}: ErrorStatusPageProps) {
  const primaryButtonClass =
    'h-11 shrink-0 gap-1.5 rounded-md px-3 text-[13px]! font-semibold';
  const outlineButtonClass =
    'bg-background hover:bg-muted h-11 gap-1.5 rounded-md border-neutral-300 px-3.5 text-[13px]! font-semibold';

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
          <h1 className='text-foreground text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl'>
            {presentation.title}
          </h1>
          <p className='text-muted-foreground text-sm leading-relaxed sm:text-base lg:max-w-[56ch]'>
            {presentation.description}
          </p>
          {note ? <div className='text-muted-foreground text-xs'>{note}</div> : null}
          <div className='flex flex-wrap items-center justify-center gap-2.5 pt-2 sm:gap-3 md:justify-start'>
            {onRetry ? (
              <Button
                type='button'
                variant='outline'
                className={outlineButtonClass}
                onClick={onRetry}
              >
                <RotateCcw className='size-3.5' />
                {retryLabel}
              </Button>
            ) : null}
            <Button asChild className={primaryButtonClass}>
              <Link href={primaryHref}>
                <House className='size-3.5' />
                {primaryLabel}
              </Link>
            </Button>
            {secondaryHref && secondaryLabel ? (
              <Button asChild variant='outline' className={outlineButtonClass}>
                <Link href={secondaryHref}>
                  <LifeBuoy className='size-3.5' />
                  {secondaryLabel}
                </Link>
              </Button>
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
