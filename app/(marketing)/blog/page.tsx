import type { Metadata } from 'next';

import BlogIntroSection from './_sections/BlogIntroSection';
import ExploreArticlesSection from './_sections/ExploreArticlesSection';

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
    </>
  );
}
