import type { Metadata } from 'next';

import AboutOverviewSection from '@/components/marketing/sections/home/AboutOverviewSection';
import HomeIntroSection from '@/components/marketing/sections/home/HomeIntroSection';
import HowItWorksSection from '@/components/marketing/sections/home/HowItWorksSection';
import LatestArticlesSection from '@/components/marketing/sections/home/LatestArticlesSection';
import MobileAppSection from '@/components/marketing/sections/home/MobileAppSection';
import OurProgramsSection from '@/components/marketing/sections/home/OurProgramsSection';
import TestimonialsSection from '@/components/marketing/sections/home/TestimonialsSection';

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
