import type { Metadata } from 'next';

import BlogIntroSection from '@/components/marketing/sections/blog/BlogIntroSection';
import ExploreArticlesSection from '@/components/marketing/sections/blog/ExploreArticlesSection';
import CallToActionSection from '@/components/marketing/sections/home/CallToActionSection';

export const metadata: Metadata = {
  title: 'Blog | SaKyi Health & Wellness',
  description:
    'Read insights, tips, and stories from SaKyi Health & Wellness on nutrition, movement, mindset, and sustainable lifestyle change.',
};

export default function BlogPage() {
  return (
    <>
      <BlogIntroSection />

      <ExploreArticlesSection />

      <CallToActionSection />
    </>
  );
}
