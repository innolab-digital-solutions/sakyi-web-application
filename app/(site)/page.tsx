import HeroSection from '@/components/site/pages/home/HeroSection';
import AboutSection from '@/components/site/pages/home/AboutSection';
import HowItWorksSection from '@/components/site/pages/home/HowItWorksSection';
import MobileAppSection from '@/components/site/pages/home/MobileAppSection';
import OurProgramsSection from '@/components/site/pages/home/OurProgramsSection';
import TestimonialsSection from '@/components/site/pages/home/TestimonialsSection';
import LatestArticlesSection from '@/components/site/pages/home/LatestArticlesSection';

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
