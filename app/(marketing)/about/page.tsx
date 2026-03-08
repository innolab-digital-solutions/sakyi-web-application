import type { Metadata } from 'next';

import AboutIntroSection from './_sections/AboutIntroSection';
import BeyondWeightLossSection from './_sections/BeyondWeightLossSection';
import MissionAndPhilosophySection from './_sections/MissionAndPhilosophySection';
import OurApproachSection from './_sections/OurApproachSection';
import OurExpertTeamSection from './_sections/OurExpertTeamSection';

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
