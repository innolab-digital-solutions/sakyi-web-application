import HeroSection from '@/components/public/pages/home/HeroSection';
import AboutSection from '@/components/public/pages/home/AboutSection';
import HowItWorkSection from '@/components/public/pages/home/HowItWorkSection';
import MobileAppSection from '@/components/public/pages/home/MobileAppSection';
import OurProgramSection from '@/components/public/pages/home/OurProgramSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <AboutSection />

      <OurProgramSection />

      <HowItWorkSection />

      <MobileAppSection />
    </>
  );
}
