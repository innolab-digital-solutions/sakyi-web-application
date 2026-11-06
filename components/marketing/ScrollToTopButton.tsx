'use client';

import { ArrowUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils/styles';

/** How far the visitor has to scroll (px) before the button appears. */
const SHOW_AFTER_PX = 400;

const RING_RADIUS = 24;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Floating "back to top" button, stacked above the Tawk chat bubble.
 *
 * The ring around the arrow fills as the visitor moves down the page. It is
 * written straight to the DOM so scrolling only re-renders when the button
 * crosses {@link SHOW_AFTER_PX}.
 */
const ScrollToTopButton = () => {
  const { translate } = useLanguage();
  const ringRef = useRef<SVGCircleElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const { scrollHeight, clientHeight } = document.documentElement;
      const scrollable = scrollHeight - clientHeight;
      const progress =
        scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;

      ringRef.current?.style.setProperty(
        'stroke-dashoffset',
        String(RING_CIRCUMFERENCE * (1 - progress)),
      );
      setIsVisible(window.scrollY > SHOW_AFTER_PX);
    };

    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  const label = translate('marketing.layout.scroll-to-top');

  return (
    <button
      type='button'
      onClick={scrollToTop}
      aria-label={label}
      title={label}
      className={cn(
        'group focus-visible:ring-brand/50 fixed right-7 bottom-23 z-40 h-13 w-13 cursor-pointer rounded-full bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:ring-4 focus-visible:outline-none',
        isVisible
          ? 'visible translate-y-0 scale-100 opacity-100'
          : 'invisible translate-y-3 scale-90 opacity-0',
      )}
    >
      {/* Scroll progress ring */}
      <svg
        viewBox='0 0 52 52'
        aria-hidden='true'
        className='absolute inset-0 h-full w-full -rotate-90'
      >
        <defs>
          <linearGradient id='scroll-to-top-ring' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' style={{ stopColor: 'var(--brand)' }} />
            <stop offset='100%' style={{ stopColor: 'var(--brand-deep)' }} />
          </linearGradient>
        </defs>
        <circle
          cx='26'
          cy='26'
          r={RING_RADIUS}
          fill='none'
          strokeWidth='3'
          className='stroke-slate-200'
        />
        <circle
          ref={ringRef}
          cx='26'
          cy='26'
          r={RING_RADIUS}
          fill='none'
          stroke='url(#scroll-to-top-ring)'
          strokeWidth='3'
          strokeLinecap='round'
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={RING_CIRCUMFERENCE}
        />
      </svg>

      <span className='bg-brand-gradient absolute inset-1.5 flex items-center justify-center rounded-full text-white'>
        <ArrowUp
          aria-hidden='true'
          strokeWidth={2.5}
          className='h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5'
        />
      </span>
    </button>
  );
};

export default ScrollToTopButton;
