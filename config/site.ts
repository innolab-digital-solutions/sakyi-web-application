/**
 * Site-wide identity used for SEO: canonical URLs, metadata, and structured data.
 *
 * `www` is the production host; the apex domain redirects to it in Vercel, so
 * canonical URLs must never point at the apex.
 */
const DEFAULT_SITE_URL = 'https://www.sakyihealthandwellness.com';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL?.trim() || DEFAULT_SITE_URL
).replace(/\/+$/, '');

export const SITE_NAME = 'SaKyi Health & Wellness';

export const SITE_DESCRIPTION =
  'Personalized wellness programs to support your health journey.';

export const SITE_TITLE_TEMPLATE = `%s | ${SITE_NAME}`;

export const DEFAULT_OG_IMAGE = {
  url: '/images/og-default.jpg',
  width: 1200,
  height: 630,
  alt: 'Group of adults exercising together outdoors with SaKyi Health & Wellness',
};

export const SITE_LOGO_PATH = '/images/logo.png';

export const SITE_CONTACT = {
  email: 'customerservice@sakyihealthandwellness.com',
  telephone: '+959250357339',
} as const;

export const SITE_SOCIAL_PROFILES = [
  'https://www.facebook.com/sakyihealthandwellness',
  'https://www.instagram.com/sakyihealthandwellness',
  'https://www.youtube.com/@sakyihealthandwellness',
  'https://www.tiktok.com/@sakyihealthandwellness',
] as const;
