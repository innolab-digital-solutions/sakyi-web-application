import type { Metadata } from 'next';
import HeroSection from '@/components/site/pages/home/HeroSection';
import AboutSection from '@/components/site/pages/home/AboutSection';
import HowItWorksSection from '@/components/site/pages/home/HowItWorksSection';
import MobileAppSection from '@/components/site/pages/home/MobileAppSection';
import OurProgramsSection from '@/components/site/pages/home/OurProgramsSection';
import TestimonialsSection from '@/components/site/pages/home/TestimonialsSection';
import LatestArticlesSection from '@/components/site/pages/home/LatestArticlesSection';

export const metadata: Metadata = {
  title: 'SaKyi Health & Wellness | Personalized Wellness Programs',
  description:
    'Discover SaKyi Health & Wellness — personalized nutrition, movement, and lifestyle programs designed to support sustainable health and long-term wellbeing.',
};

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <AboutSection />

      <OurProgramsSection />

      <HowItWorksSection />

      <MobileAppSection />

      <TestimonialsSection />

      <LatestArticlesSection />
    </>
  );
}
