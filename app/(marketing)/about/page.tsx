import type { Metadata } from 'next';

import AboutIntroSection from '@/components/marketing/sections/about/AboutIntroSection';
import BeyondWeightLossSection from '@/components/marketing/sections/about/BeyondWeightLossSection';
import CallToActionSection from '@/components/marketing/sections/about/CallToActionSection';
import MissionAndPhilosophySection from '@/components/marketing/sections/about/MissionAndPhilosophySection';
import OurApproachSection from '@/components/marketing/sections/about/OurApproachSection';
import OurExpertTeamSection from '@/components/marketing/sections/about/OurExpertTeamSection';

export const metadata: Metadata = {
  title: 'About SaKyi Health & Wellness',
  description:
    'Learn about SaKyi Health & Wellness, our mission, philosophy, and multidisciplinary team dedicated to delivering personalized, evidence-based wellness care.',
};

export default function AboutPage() {
  return (
    <>
      <AboutIntroSection />

      <MissionAndPhilosophySection />

      <OurApproachSection />

      <OurExpertTeamSection />

      <BeyondWeightLossSection />

      <CallToActionSection />
    </>
  );
}
