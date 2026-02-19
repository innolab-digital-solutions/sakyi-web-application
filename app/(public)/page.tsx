import HeroSection from '@/components/public/pages/home/HeroSection';
import AboutSection from '@/components/public/pages/home/AboutSection';
import HowItWorkSection from '@/components/public/pages/home/HowItWorkSection';
import MobileAppSection from '@/components/public/pages/home/MobileAppSection';
import Navbar from '@/components/public/layouts/Navbar';
import Footer from '@/components/public/layouts/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />

      <HeroSection />

      <AboutSection />

      <HowItWorkSection />

      <MobileAppSection />

      <Footer />
    </>
  );
}
