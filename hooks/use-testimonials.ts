'use client';

import { useMemo } from 'react';

import { FALLBACK_LANGUAGE } from '@/config/languages';
import {
  TESTIMONIAL_IDS,
  type TestimonialId,
  testimonialKeys,
} from '@/config/marketing/testimonials';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/localization';

export type Testimonial = {
  id: TestimonialId;
  clientName: string;
  programTitle: string;
  content: string;
};

/**
 * Resolves one field, treating a blank entry as "not translated yet".
 *
 * `translate` falls back to English only when a key is *absent*; an empty
 * string is still a string and would render blank. The Myanmar entries are
 * scaffolded with empty strings to be filled in later, so each field falls back
 * to English individually until it has real copy.
 *
 * Returns an empty string when neither dictionary has the key, since
 * `getTranslation` echoes the key path back when it finds nothing.
 */
const resolveField = (
  translate: (key: string) => string,
  key: string,
): string => {
  const value = translate(key).trim();
  if (value && value !== key) return value;

  const fallback = getTranslation(FALLBACK_LANGUAGE, key).trim();
  return fallback === key ? '' : fallback;
};

/**
 * Resolves the configured testimonial ids into localized testimonials for the
 * active language. Entries with no copy in either dictionary are dropped, so
 * the carousel never renders an empty quote card.
 *
 * @see config/marketing/testimonials - the ids and dictionary key paths
 */
export const useTestimonials = (): Testimonial[] => {
  const { translate } = useLanguage();

  return useMemo(
    () =>
      TESTIMONIAL_IDS.map((id) => {
        const keys = testimonialKeys(id);
        return {
          id,
          clientName: resolveField(translate, keys.clientName),
          programTitle: resolveField(translate, keys.programTitle),
          content: resolveField(translate, keys.content),
        };
      }).filter((testimonial) => testimonial.content !== ''),
    [translate],
  );
};
