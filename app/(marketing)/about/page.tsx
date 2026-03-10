import type { Metadata } from 'next';

import AboutIntroSection from '../../../components/marketing/pages/about/AboutIntroSection';
import BeyondWeightLossSection from '../../../components/marketing/pages/about/BeyondWeightLossSection';
import MissionAndPhilosophySection from '../../../components/marketing/pages/about/MissionAndPhilosophySection';
import OurApproachSection from '../../../components/marketing/pages/about/OurApproachSection';
import OurExpertTeamSection from '../../../components/marketing/pages/about/OurExpertTeamSection';

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
