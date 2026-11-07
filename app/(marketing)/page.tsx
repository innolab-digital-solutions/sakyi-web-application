import type { Metadata } from 'next';

import CallToActionSection from '@/components/marketing/sections/CallToActionSection';
import AboutOverviewSection from '@/components/marketing/sections/home/AboutOverviewSection';
import HomeIntroSection from '@/components/marketing/sections/home/HomeIntroSection';
import HowItWorksSection from '@/components/marketing/sections/home/HowItWorksSection';
import LatestArticlesSection from '@/components/marketing/sections/home/LatestArticlesSection';
import MobileAppSection from '@/components/marketing/sections/home/MobileAppSection';
import OurProgramsSection from '@/components/marketing/sections/home/OurProgramsSection';
import TestimonialsSection from '@/components/marketing/sections/home/TestimonialsSection';
import { ROUTES } from '@/config/routes';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: {
    absolute: 'SaKyi Health & Wellness | Personalized Wellness Programs',
  },
  description:
    'Discover SaKyi Health & Wellness — personalized nutrition, movement, and lifestyle programs designed to support sustainable health and long-term wellbeing.',
  path: ROUTES.MARKETING.HOME,
});

export default function HomePage() {
  return (
    <>
      <HomeIntroSection />

      <AboutOverviewSection />

      <OurProgramsSection />

      <HowItWorksSection />

      <MobileAppSection />

      <TestimonialsSection />

      <LatestArticlesSection />

      <CallToActionSection
        id='home-cta-section'
        translationPrefix='marketing.pages.home.call-to-action'
      />
    </>
  );
}
