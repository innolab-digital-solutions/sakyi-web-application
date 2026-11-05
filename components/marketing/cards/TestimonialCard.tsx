'use client';

import { ArrowRight, Quote, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { TESTIMONIAL_CONTROL_KEYS } from '@/config/marketing/testimonials';
import { useLanguage } from '@/context/LanguageContext';
import type { Testimonial } from '@/hooks/use-testimonials';
import { cn } from '@/lib/utils/styles';

type TestimonialCardProps = {
  testimonial: Testimonial;
  /** Notifies the carousel so autoplay holds while the full story is open. */
  onExpandedChange?: (isExpanded: boolean) => void;
  className?: string;
};

/** Initials shown when a client has no photo, e.g. "Ma Pan Nu" -> "MP". */
const getInitials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

/** Round client photo, falling back to initials when there is no photo. */
const Avatar = ({
  testimonial,
  sizes,
  className,
}: {
  testimonial: Testimonial;
  sizes: string;
  className?: string;
}) => (
  <div
    className={cn(
      'bg-brand-gradient relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-sans text-base font-semibold text-white',
      className,
    )}
  >
    {testimonial.image ? (
      <Image
        src={testimonial.image}
        alt={testimonial.clientName}
        fill
        sizes={sizes}
        className='object-cover'
      />
    ) : (
      getInitials(testimonial.clientName)
    )}
  </div>
);

const Attribution = ({
  testimonial,
  className,
}: {
  testimonial: Testimonial;
  className?: string;
}) => (
  <div className={cn('flex items-center gap-3', className)}>
    <Avatar
      testimonial={testimonial}
      sizes='(min-width: 640px) 72px, 64px'
      className='h-16 w-16 shadow-sm sm:h-18 sm:w-18'
    />
    <div className='min-w-0 text-left'>
      <p className='truncate font-sans text-base font-semibold text-slate-900'>
        {testimonial.clientName}
      </p>
      <p className='text-brand truncate font-sans text-sm font-medium'>
        {testimonial.programTitle}
      </p>
    </div>
  </div>
);

/**
 * A single client quote, styled as a message block: the attribution sits on top
 * and the quote hangs beneath it in a bubble whose tail points back up at the
 * person who said it.
 *
 * Testimonials vary widely in length, so the quote is clamped to a fixed number
 * of lines to keep every card the same compact height. Anything longer than the
 * clamp gets a control that opens the full text in a dialog, so nothing is cut
 * from the record.
 */
const TestimonialCard = ({
  testimonial,
  onExpandedChange,
  className,
}: TestimonialCardProps) => {
  const { translate } = useLanguage();
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Whether the clamp actually cut anything can only be known from layout, and
  // it changes with viewport width and script (Myanmar lines run taller).
  useEffect(() => {
    const quote = quoteRef.current;
    if (!quote) return;

    const measure = () =>
      setIsTruncated(quote.scrollHeight - quote.clientHeight > 1);

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(quote);
    return () => observer.disconnect();
  }, [testimonial.content]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onExpandedChange?.(open);
  };

  return (
    <>
      <figure className={cn('group flex h-full flex-col', className)}>
        <figcaption className='mb-5 pl-2'>
          <Attribution testimonial={testimonial} />
        </figcaption>

        {/* Message bubble */}
        <div className='hover:border-brand/30 relative flex flex-1 flex-col rounded-3xl rounded-tl-md border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-7'>
          {/* Bubble tail, pointing up at the attribution above */}
          <div
            aria-hidden='true'
            className='group-hover:border-brand/30 absolute -top-px left-8 h-4 w-4 -translate-y-1/2 rotate-45 border-t border-l border-slate-200 bg-white transition-colors duration-300'
          />

          <div className='from-brand/10 to-brand-deep/10 mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br'>
            <Quote className='text-brand h-5 w-5' aria-hidden='true' />
          </div>

          <blockquote>
            {/* `whitespace-pre-line` keeps paragraph breaks authored as \n. */}
            <p
              ref={quoteRef}
              className='line-clamp-8 font-sans text-base leading-relaxed whitespace-pre-line text-slate-600'
            >
              {testimonial.content}
            </p>
          </blockquote>

          {isTruncated && (
            <button
              type='button'
              onClick={() => handleOpenChange(true)}
              className='text-brand hover:text-brand-hover focus-visible:ring-brand/40 group/more mt-4 inline-flex cursor-pointer items-center gap-1.5 self-start rounded-full font-sans text-sm font-semibold transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none'
            >
              {translate(TESTIMONIAL_CONTROL_KEYS.readMore)}
              <ArrowRight className='h-4 w-4 transition-transform duration-300 group-hover/more:translate-x-1' />
            </button>
          )}
        </div>
      </figure>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className='flex max-h-[85dvh] flex-col gap-0 overflow-hidden rounded-3xl border-0 bg-white p-0 shadow-2xl sm:max-w-[min(42rem,calc(100%-2rem))]'
        >
          {/* Brand band, with the quote mark as a watermark */}
          <div className='bg-brand-gradient relative h-20 shrink-0 overflow-hidden sm:h-24'>
            <div
              aria-hidden='true'
              className='absolute -top-12 -left-8 h-36 w-36 rounded-full bg-white/10'
            />
            <Quote
              aria-hidden='true'
              fill='currentColor'
              strokeWidth={0}
              className='absolute right-16 -bottom-5 h-28 w-28 text-white/20 sm:right-20 sm:h-32 sm:w-32'
            />
          </div>

          <DialogClose
            aria-label={translate(TESTIMONIAL_CONTROL_KEYS.close)}
            className='absolute top-4 right-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white transition-colors duration-200 hover:bg-white/35 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none'
          >
            <X className='h-5 w-5' aria-hidden='true' />
          </DialogClose>

          {/* The photo overlaps the band, like a signature on a letterhead */}
          <div className='flex shrink-0 items-start gap-4 px-6 sm:gap-5 sm:px-10'>
            <Avatar
              testimonial={testimonial}
              sizes='(min-width: 640px) 96px, 80px'
              className='-mt-10 h-20 w-20 text-xl shadow-lg ring-4 ring-white sm:-mt-12 sm:h-24 sm:w-24 sm:text-2xl'
            />
            <div className='min-w-0 space-y-1.5 pt-3 text-left sm:pt-4'>
              <DialogTitle className='font-sans text-lg leading-snug font-semibold text-slate-900 sm:text-xl'>
                {testimonial.clientName}
              </DialogTitle>
              <span className='bg-brand/10 text-brand-hover inline-block rounded-full px-3 py-1 font-sans text-xs font-semibold sm:text-sm'>
                {testimonial.programTitle}
              </span>
            </div>
          </div>

          <div className='relative mt-5 flex min-h-0 flex-1 flex-col sm:mt-6'>
            <DialogDescription asChild>
              <blockquote className='min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-10 font-sans text-base leading-8 text-slate-700 sm:px-10 sm:text-[1.0625rem]'>
                {testimonial.content
                  .split('\n')
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </blockquote>
            </DialogDescription>

            {/* Fades the text out at the bottom edge while there is more to read */}
            <div
              aria-hidden='true'
              className='pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-white to-transparent'
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TestimonialCard;
