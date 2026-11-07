import { ROUTES } from '@/config/routes';
import {
  SITE_CONTACT,
  SITE_DESCRIPTION,
  SITE_LOGO_PATH,
  SITE_NAME,
  SITE_SOCIAL_PROFILES,
  SITE_URL,
} from '@/config/site';
import type { BlogPost } from '@/domains/blogs/types';
import { resolveApiImageUrl, resolveMarketingSiteUrl } from '@/lib/utils/url';

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

/**
 * `Organization`, not `MedicalBusiness`: the privacy policy states Sa Kyi is not
 * a clinical or medical institution. `LocalBusiness` needs a public address,
 * which the site does not publish.
 */
export const organizationJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: SITE_NAME,
  url: SITE_URL,
  logo: resolveMarketingSiteUrl(SITE_LOGO_PATH),
  description: SITE_DESCRIPTION,
  email: SITE_CONTACT.email,
  telephone: SITE_CONTACT.telephone,
  sameAs: [...SITE_SOCIAL_PROFILES],
});

export const websiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  publisher: { '@id': ORGANIZATION_ID },
});

export const blogPostingJsonLd = (post: BlogPost) => {
  const url = resolveMarketingSiteUrl(ROUTES.MARKETING.BLOG_POST(post.slug));
  const image = resolveApiImageUrl(post.thumbnail_url);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    url,
    mainEntityOfPage: url,
    author: {
      '@id': ORGANIZATION_ID,
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: { '@id': ORGANIZATION_ID },
    ...(post.excerpt ? { description: post.excerpt } : {}),
    ...(image ? { image } : {}),
    ...(post.published_at ? { datePublished: post.published_at } : {}),
  };
};
