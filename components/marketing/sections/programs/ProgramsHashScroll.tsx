'use client';

import { useEffect } from 'react';

import { scrollToElement } from '@/lib/utils/scroll';

const FAQ_HASHES = new Set(['#faqs', '#faq', '#faq-section']);

const ProgramsHashScroll = () => {
  useEffect(() => {
    const scrollFromHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (!FAQ_HASHES.has(hash)) {
        return;
      }

      // Defer until paint so the section exists and layout is stable.
      requestAnimationFrame(() => {
        scrollToElement('faq-section');
      });
    };

    scrollFromHash();
    window.addEventListener('hashchange', scrollFromHash);

    return () => {
      window.removeEventListener('hashchange', scrollFromHash);
    };
  }, []);

  return null;
};

export default ProgramsHashScroll;
