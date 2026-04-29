'use client';

import { useEffect } from 'react';

import { scrollToElement } from '@/lib/utils/scroll';

const CONTACT_FORM_HASHES = new Set(['#form', '#contact-form', '#message']);

const ContactHashScroll = () => {
  useEffect(() => {
    const scrollFromHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (!CONTACT_FORM_HASHES.has(hash)) {
        return;
      }

      // Defer until paint so the section exists and layout is stable.
      requestAnimationFrame(() => {
        scrollToElement('send-us-message-section');
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

export default ContactHashScroll;
