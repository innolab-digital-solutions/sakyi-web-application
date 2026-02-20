import HeroSection from '@/components/public/pages/home/HeroSection';
import AboutSection from '@/components/public/pages/home/AboutSection';
import HowItWorkSection from '@/components/public/pages/home/HowItWorkSection';
import MobileAppSection from '@/components/public/pages/home/MobileAppSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <AboutSection />

      <HowItWorkSection />

      <MobileAppSection />
    </>
  );
}
