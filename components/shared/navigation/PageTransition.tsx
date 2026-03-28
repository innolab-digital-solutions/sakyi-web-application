'use client';

import { usePathname } from 'next/navigation';
import type { CSSProperties, PropsWithChildren } from 'react';

import { cn } from '@/lib/utils/styles';

type TransitionEffect = 'fade' | 'scale' | 'slide' | 'zoom';

type PageTransitionProps = PropsWithChildren<{
  effect?: TransitionEffect;
  /** Animation length in ms; higher = easier to notice (still respects reduced-motion). */
  durationMs?: number;
  className?: string;
}>;

const EFFECT_CLASS: Record<TransitionEffect, string> = {
  fade: 'route-transition route-transition--fade',
  scale: 'route-transition route-transition--scale',
  slide: 'route-transition route-transition--slide',
  zoom: 'route-transition route-transition--zoom',
};

/**
 * Animates route content on client-side navigation. Uses pathname as React key so
 * the animated shell remounts on each route change (layouts do not remount).
 * Wrap only page content in a layout so chrome (nav, sidebar) stays stable.
 */
const PageTransition = ({
  children,
  effect = 'fade',
  durationMs = 420,
  className,
}: PageTransitionProps) => {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className={cn(EFFECT_CLASS[effect], className)}
      style={
        {
          '--route-transition-duration': `${durationMs}ms`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
};

export default PageTransition;
