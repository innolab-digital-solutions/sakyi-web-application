/**
 * Structured data for the client testimonials carousel.
 *
 * Each testimonial is identified by a stable id listed in {@link TESTIMONIAL_IDS}.
 * The copy itself lives in the localization dictionaries so translators work in
 * one place, mirroring how the rest of the marketing site handles repeated
 * content (see `OurExpertTeamSection`, `FAQSection`).
 *
 * To add a testimonial:
 *  1. Append its id to {@link TESTIMONIAL_IDS} (array order = display order).
 *  2. Add a matching block under `testimonials.items.<id>` in BOTH
 *     `lib/localization/dictionaries/en/marketing/pages/home.json` and
 *     `.../my/marketing/pages/home.json`, each with `client-name`,
 *     `program-title` and `content`.
 *
 * A missing Myanmar entry falls back to English rather than breaking, and an
 * empty {@link TESTIMONIAL_IDS} hides the section entirely.
 *
 * @see lib/localization/dictionaries/en/marketing/pages/home.json
 * @see hooks/use-testimonials - resolves these ids into localized objects
 */

/** Dictionary namespace holding every testimonial's localized copy. */
export const TESTIMONIALS_DICTIONARY_PREFIX =
  'marketing.pages.home.testimonials';

/**
 * Stable testimonial ids, in display order.
 *
 * NOTE: the current entries are placeholder samples used to build out the
 * carousel. Replace them with real, consented client quotes before launch.
 */
export const TESTIMONIAL_IDS = [
  'lin-nay-chi-kyaw',
  'ma-pan-nu',
  'hnin-oo-yin',
  'shin-thant',
  'ma-nay-chi-lin',
  'hsu-thiri-soe',
  'ma-ar-mee',
  'khaing-su-lwin',
] as const;

export type TestimonialId = (typeof TESTIMONIAL_IDS)[number];

/** Dictionary key paths for a single testimonial's fields. */
export const testimonialKeys = (id: TestimonialId) => ({
  clientName: `${TESTIMONIALS_DICTIONARY_PREFIX}.items.${id}.client-name`,
  programTitle: `${TESTIMONIALS_DICTIONARY_PREFIX}.items.${id}.program-title`,
  content: `${TESTIMONIALS_DICTIONARY_PREFIX}.items.${id}.content`,
});

/** Dictionary key paths for the carousel's accessible control labels. */
export const TESTIMONIAL_CONTROL_KEYS = {
  label: `${TESTIMONIALS_DICTIONARY_PREFIX}.controls.label`,
  previous: `${TESTIMONIALS_DICTIONARY_PREFIX}.controls.previous`,
  next: `${TESTIMONIALS_DICTIONARY_PREFIX}.controls.next`,
  readMore: `${TESTIMONIALS_DICTIONARY_PREFIX}.controls.read-more`,
} as const;
