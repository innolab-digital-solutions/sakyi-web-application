import type { Metadata } from 'next';

import AboutIntroSection from '@/components/site/pages/about/AboutIntroSection';
import BeyondWeightLossSection from '@/components/site/pages/about/BeyondWeightLossSection';
import MissionAndPhilosophySection from '@/components/site/pages/about/MissionAndPhilosophySection';
import OurApproachSection from '@/components/site/pages/about/OurApproachSection';
import OurExpertTeamSection from '@/components/site/pages/about/OurExpertTeamSection';

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
    </>
  );
}
