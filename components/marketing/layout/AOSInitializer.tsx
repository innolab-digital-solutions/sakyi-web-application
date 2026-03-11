'use client';

import 'aos/dist/aos.css';

import { PropsWithChildren, useEffect } from 'react';

const AOSInitializer = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    let mounted = true;

    const initAOS = async () => {
      const AOS = (await import('aos')).default;

      requestAnimationFrame(() => {
        if (!mounted) return;

        setTimeout(() => {
          AOS.init({
            duration: 600,
            easing: 'ease-out',
            once: true,
            offset: 50,
          });

          AOS.refreshHard();
        }, 0);
      });
    };

    initAOS();

    return () => {
      mounted = false;
    };
  }, []);

  return <>{children}</>;
};

export default AOSInitializer;
