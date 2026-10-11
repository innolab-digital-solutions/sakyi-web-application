'use client';

import { ArrowRight, Quote } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
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

/** Initials shown in the avatar bubble, e.g. "Lin Nay Chi Kyaw" -> "LN". */
const getInitials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const Attribution = ({
  testimonial,
  className,
}: {
  testimonial: Testimonial;
  className?: string;
}) => (
  <div className={cn('flex items-center gap-3', className)}>
    <div className='bg-brand-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-sans text-sm font-semibold text-white shadow-sm'>
      {getInitials(testimonial.clientName)}
    </div>
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
        <DialogContent className='max-w-xl gap-0 sm:max-w-3xl [&_[data-slot=dialog-close]]:cursor-pointer'>
          <DialogHeader className='space-y-4'>
            <DialogTitle className='sr-only'>
              {testimonial.clientName}
            </DialogTitle>
            <Attribution testimonial={testimonial} />
          </DialogHeader>

          <DialogDescription asChild>
            <blockquote className='mt-6 max-h-[60vh] overflow-y-auto pr-1'>
              <p className='font-sans text-base leading-relaxed whitespace-pre-line text-slate-600'>
                {testimonial.content}
              </p>
            </blockquote>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TestimonialCard;
