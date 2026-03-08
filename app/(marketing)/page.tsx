import type { Metadata } from 'next';

import AboutOverviewSection from './_sections/AboutOverviewSection';
import HomeIntroSection from './_sections/HomeIntroSection';
import HowItWorksSection from './_sections/HowItWorksSection';
import LatestArticlesSection from './_sections/LatestArticlesSection';
import MobileAppSection from './_sections/MobileAppSection';
import OurProgramsSection from './_sections/OurProgramsSection';
import TestimonialsSection from './_sections/TestimonialsSection';

export const metadata: Metadata = {
  title: 'SaKyi Health & Wellness | Personalized Wellness Programs',
  description:
    'Discover SaKyi Health & Wellness — personalized nutrition, movement, and lifestyle programs designed to support sustainable health and long-term wellbeing.',
};

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
    </>
  );
}
