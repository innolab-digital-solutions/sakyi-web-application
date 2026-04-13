'use client';

import 'aos/dist/aos.css';

import { PropsWithChildren, useEffect } from 'react';

type AosApi = {
  init: (settings?: Record<string, unknown>) => unknown;
  refresh: () => unknown;
  refreshHard: () => unknown;
};

const AOSInitializer = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    let mounted = true;
    let aosModule: AosApi | null = null;
    let didInit = false;
    let initInFlight = false;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );

    const refreshAosHard = () => {
      if (!mounted || !aosModule || prefersReducedMotion.matches) return;
      aosModule.refreshHard();
    };

    const refreshAosSoft = () => {
      if (!mounted || !aosModule || prefersReducedMotion.matches) return;
      aosModule.refresh();
    };

    let layoutRefreshTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let layoutResizeObserver: ResizeObserver | null = null;
    let lastScrollResyncMs = 0;

    const detachLayoutWatchers = () => {
      layoutResizeObserver?.disconnect();
      layoutResizeObserver = null;
      if (layoutRefreshTimeoutId !== null) {
        clearTimeout(layoutRefreshTimeoutId);
        layoutRefreshTimeoutId = null;
      }
      window.removeEventListener('scroll', onWindowScroll);
    };

    const scheduleLayoutRefreshHard = () => {
      if (layoutRefreshTimeoutId !== null) {
        clearTimeout(layoutRefreshTimeoutId);
      }
      layoutRefreshTimeoutId = setTimeout(() => {
        layoutRefreshTimeoutId = null;
        refreshAosHard();
      }, 120);
    };

    const onWindowScroll = () => {
      if (!mounted || prefersReducedMotion.matches || !aosModule) return;
      const now = performance.now();
      if (now - lastScrollResyncMs < 200) return;
      lastScrollResyncMs = now;
      refreshAosSoft();
    };

    const initAOS = async () => {
      if (!mounted || prefersReducedMotion.matches || didInit || initInFlight) {
        return;
      }

      initInFlight = true;

      try {
        const imported = await import('aos');
        const AOS = ((imported as unknown as { default?: AosApi }).default ??
          (imported as unknown as AosApi)) as AosApi;
        if (!mounted || prefersReducedMotion.matches || didInit) {
          initInFlight = false;
          return;
        }

        aosModule = AOS;

        requestAnimationFrame(() => {
          if (!mounted || prefersReducedMotion.matches || didInit) {
            initInFlight = false;
            return;
          }

          setTimeout(() => {
            try {
              if (!mounted || prefersReducedMotion.matches || didInit) {
                return;
              }

              AOS.init({
                duration: 600,
                easing: 'ease-out',
                once: true,
                offset: 50,
              });

              AOS.refreshHard();
              didInit = true;

              if (document.readyState === 'complete') {
                AOS.refreshHard();
              } else {
                window.addEventListener('load', refreshAosHard, { once: true });
              }

              // Images, fonts, and React Query layout shifts do not always mutate
              // [data-aos] nodes; without a refresh, stored trigger Y stays stale and
              // sections stay at opacity:0 until scroll "catches up".
              if (typeof document !== 'undefined' && document.fonts?.ready) {
                void document.fonts.ready.then(() => {
                  if (mounted && !prefersReducedMotion.matches) {
                    scheduleLayoutRefreshHard();
                  }
                });
              }

              detachLayoutWatchers();
              if (typeof ResizeObserver !== 'undefined') {
                layoutResizeObserver = new ResizeObserver(() => {
                  if (!mounted || prefersReducedMotion.matches) return;
                  scheduleLayoutRefreshHard();
                });
                layoutResizeObserver.observe(document.body);
              }

              window.addEventListener('scroll', onWindowScroll, {
                passive: true,
              });

              for (const delayMs of [400, 1200, 2400]) {
                window.setTimeout(() => {
                  if (mounted && !prefersReducedMotion.matches) {
                    scheduleLayoutRefreshHard();
                  }
                }, delayMs);
              }
            } finally {
              initInFlight = false;
            }
          }, 0);
        });
      } catch {
        initInFlight = false;
      }
    };

    void initAOS();

    const onPreferenceChange = () => {
      if (!mounted) return;

      if (!prefersReducedMotion.matches) {
        void initAOS();
        refreshAosHard();
        return;
      }

      if (aosModule) {
        document
          .querySelectorAll<HTMLElement>('[data-aos].aos-animate')
          .forEach((el) => el.classList.remove('aos-animate'));
      }
    };

    prefersReducedMotion.addEventListener('change', onPreferenceChange);

    return () => {
      mounted = false;
      detachLayoutWatchers();
      window.removeEventListener('load', refreshAosHard);
      prefersReducedMotion.removeEventListener('change', onPreferenceChange);
    };
  }, []);

  return <>{children}</>;
};

export default AOSInitializer;
