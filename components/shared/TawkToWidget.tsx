'use client';

import { useEffect } from 'react';

export default function TawkToWidget() {
  useEffect(() => {
    if (document.getElementById('tawk-to-script')) return;

    (window as Window & { Tawk_API?: object; Tawk_LoadStart?: Date }).Tawk_API =
      (window as Window & { Tawk_API?: object }).Tawk_API ?? {};
    (window as Window & { Tawk_LoadStart?: Date }).Tawk_LoadStart = new Date();

    const s1 = document.createElement('script');
    const s0 = document.getElementsByTagName('script')[0];
    s1.id = 'tawk-to-script';
    s1.async = true;
    s1.src = 'https://embed.tawk.to/69f0caac377d121c3423e2ab/1jna9fdg3';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0?.parentNode?.insertBefore(s1, s0);
  }, []);

  return null;
}
