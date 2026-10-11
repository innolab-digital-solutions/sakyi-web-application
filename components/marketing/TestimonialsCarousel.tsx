'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import TestimonialCard from '@/components/marketing/cards/TestimonialCard';
import { TESTIMONIAL_CONTROL_KEYS } from '@/config/marketing/testimonials';
import { useLanguage } from '@/context/LanguageContext';
import type { Testimonial } from '@/hooks/use-testimonials';

type TestimonialsCarouselProps = {
  testimonials: Testimonial[];
};

/** Delay between automatic advances. */
const AUTOPLAY_INTERVAL_MS = 6000;

/** How long one slide transition takes. Native smooth scrolling is noticeably
 *  snappier than this and its duration cannot be configured, which is why the
 *  track is animated manually below. */
const TRANSITION_DURATION_MS = 450;

/** Tolerance (px) when comparing scroll offsets, to absorb sub-pixel rounding. */
const SCROLL_EPSILON = 2;

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Slow start, quick middle, soft landing. */
const easeInOutCubic = (progress: number): number =>
  progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

/**
 * Testimonial carousel built on a horizontally scrollable track, so touch
 * gestures and momentum come from the browser. One card is visible on mobile,
 * two from `sm`, three from `lg`.
 *
 * Button-driven movement is animated frame by frame with an eased curve rather
 * than `scroll-behavior: smooth`, whose duration is fixed by the browser and
 * reads as abrupt. CSS snapping is suspended for the duration of that animation
 * so mandatory snap points cannot fight the per-frame scroll updates; it stays
 * active for user swipes.
 *
 * Autoplay advances every {@link AUTOPLAY_INTERVAL_MS} and pauses while the
 * viewer hovers or focuses the carousel, or once they swipe it. It is disabled
 * outright when the viewer prefers reduced motion.
 */
const TestimonialsCarousel = ({ testimonials }: TestimonialsCarouselProps) => {
  const { translate } = useLanguage();
  const trackRef = useRef<HTMLUListElement>(null);
  const frameRef = useRef<number | null>(null);
  /** Where the track is heading, so rapid clicks queue up instead of colliding. */
  const targetScrollRef = useRef(0);

  // Seeded from the slide count so the controls render during SSR instead of
  // popping in after hydration; the scroll sync below corrects it if they fit.
  const [isScrollable, setIsScrollable] = useState(testimonials.length > 1);
  const [isPaused, setIsPaused] = useState(false);
  /** True while a card's full story dialog is open. */
  const [isExpanded, setIsExpanded] = useState(false);
  /** Which side still has cards off-screen, so only that edge is faded. */
  const [overflow, setOverflow] = useState({ start: false, end: true });

  const stopAnimation = useCallback(() => {
    if (frameRef.current === null) return;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    trackRef.current?.style.removeProperty('scroll-snap-type');
  }, []);

  /** Eases the track to an absolute scroll offset, clamped to its bounds. */
  const animateScrollTo = useCallback(
    (offset: number) => {
      const track = trackRef.current;
      if (!track) return;

      stopAnimation();

      const maxScrollLeft = track.scrollWidth - track.clientWidth;
      const to = Math.max(0, Math.min(offset, maxScrollLeft));
      const from = track.scrollLeft;
      const distance = to - from;

      targetScrollRef.current = to;

      if (prefersReducedMotion() || Math.abs(distance) < 1) {
        track.scrollLeft = to;
        return;
      }

      // Mandatory snapping would pull the track back to the nearest snap point
      // between frames; suspend it while we drive the scroll ourselves.
      track.style.scrollSnapType = 'none';

      const startedAt = performance.now();

      const step = (now: number) => {
        const progress = Math.min(
          (now - startedAt) / TRANSITION_DURATION_MS,
          1,
        );
        track.scrollLeft = from + distance * easeInOutCubic(progress);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(step);
          return;
        }
        frameRef.current = null;
        track.style.removeProperty('scroll-snap-type');
      };

      frameRef.current = requestAnimationFrame(step);
    },
    [stopAnimation],
  );

  /** Width of one slide, including its gutter — the distance of a single step. */
  const getStep = useCallback((): number => {
    const slide = trackRef.current?.children[0] as HTMLElement | undefined;
    return slide?.getBoundingClientRect().width ?? 0;
  }, []);

  /** Offset the next step should start from: the in-flight target, if any. */
  const getCurrentOffset = useCallback((): number => {
    const track = trackRef.current;
    if (!track) return 0;
    return frameRef.current !== null
      ? targetScrollRef.current
      : track.scrollLeft;
  }, []);

  const goToNext = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    const current = getCurrentOffset();

    // Already showing the last cards: start over.
    if (current >= maxScrollLeft - SCROLL_EPSILON) {
      animateScrollTo(0);
      return;
    }
    animateScrollTo(current + getStep());
  }, [animateScrollTo, getCurrentOffset, getStep]);

  const goToPrevious = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const current = getCurrentOffset();

    // At the very start: jump to the end.
    if (current <= SCROLL_EPSILON) {
      animateScrollTo(track.scrollWidth - track.clientWidth);
      return;
    }
    animateScrollTo(current - getStep());
  }, [animateScrollTo, getCurrentOffset, getStep]);

  // Track whether the cards overflow, and follow along when the viewer scrolls
  // the track themselves so the next button step starts from the right place.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;

    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const maxScrollLeft = track.scrollWidth - track.clientWidth;
        setIsScrollable(maxScrollLeft > SCROLL_EPSILON);
        setOverflow({
          start: track.scrollLeft > SCROLL_EPSILON,
          end: track.scrollLeft < maxScrollLeft - SCROLL_EPSILON,
        });
        if (frameRef.current === null) {
          targetScrollRef.current = track.scrollLeft;
        }
      });
    };

    sync();
    track.addEventListener('scroll', sync, { passive: true });

    const observer = new ResizeObserver(sync);
    observer.observe(track);

    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener('scroll', sync);
      observer.disconnect();
    };
  }, [testimonials.length]);

  // Autoplay.
  useEffect(() => {
    if (isPaused || isExpanded || !isScrollable || prefersReducedMotion()) {
      return;
    }

    const timer = window.setInterval(goToNext, AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [goToNext, isExpanded, isPaused, isScrollable]);

  // Never leave a frame loop running after unmount.
  useEffect(() => stopAnimation, [stopAnimation]);

  /** A swipe or wheel gesture takes over from any animation in flight. */
  const handleManualScroll = () => {
    stopAnimation();
    setIsPaused(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goToNext();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToPrevious();
    }
  };

  const arrowClassName =
    'hover:border-brand hover:text-brand focus-visible:ring-brand/40 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md focus-visible:ring-2 focus-visible:outline-none';

  return (
    <div
      role='region'
      aria-roledescription='carousel'
      aria-label={translate(TESTIMONIAL_CONTROL_KEYS.label)}
      className='relative'
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      onTouchStart={handleManualScroll}
      onWheel={handleManualScroll}
      onKeyDown={handleKeyDown}
    >
      {/* Edge fades hint at off-screen cards, on whichever side has them. */}
      {overflow.start && (
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-y-0 -left-4 z-10 w-8 bg-linear-to-r from-white to-transparent sm:w-14'
        />
      )}
      {overflow.end && (
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-y-0 -right-4 z-10 w-8 bg-linear-to-l from-white to-transparent sm:w-14'
        />
      )}

      <ul
        ref={trackRef}
        className='relative -mx-3 flex snap-x snap-mandatory overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
      >
        {testimonials.map((testimonial, index) => (
          <li
            key={testimonial.id}
            role='group'
            aria-roledescription='slide'
            aria-label={`${index + 1} / ${testimonials.length}`}
            className='w-full shrink-0 snap-start px-3 sm:w-1/2 lg:w-1/3'
          >
            <TestimonialCard
              testimonial={testimonial}
              onExpandedChange={setIsExpanded}
            />
          </li>
        ))}
      </ul>

      {isScrollable && (
        <div className='mt-10 flex items-center justify-center gap-4'>
          <button
            type='button'
            onClick={goToPrevious}
            aria-label={translate(TESTIMONIAL_CONTROL_KEYS.previous)}
            className={arrowClassName}
          >
            <ChevronLeft className='h-5 w-5' />
          </button>

          <button
            type='button'
            onClick={goToNext}
            aria-label={translate(TESTIMONIAL_CONTROL_KEYS.next)}
            className={arrowClassName}
          >
            <ChevronRight className='h-5 w-5' />
          </button>
        </div>
      )}
    </div>
  );
};

export default TestimonialsCarousel;
