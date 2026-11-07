import type { Metadata } from 'next';

import BlogIntroSection from '@/components/marketing/sections/blog/BlogIntroSection';
import ExploreArticlesSection from '@/components/marketing/sections/blog/ExploreArticlesSection';
import CallToActionSection from '@/components/marketing/sections/CallToActionSection';
import { ROUTES } from '@/config/routes';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Blog',
  description:
    'Read insights, tips, and stories from SaKyi Health & Wellness on nutrition, movement, mindset, and sustainable lifestyle change.',
  path: ROUTES.MARKETING.BLOG,
});

export default function BlogPage() {
  return (
    <>
      <BlogIntroSection />

      <ExploreArticlesSection />

      <CallToActionSection
        id='blog-cta-section'
        translationPrefix='marketing.pages.blog.call-to-action'
      />
    </>
  );
}
