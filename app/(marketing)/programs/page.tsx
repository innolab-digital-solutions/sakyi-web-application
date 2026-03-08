import type { Metadata } from 'next';

import ExploreProgramsSection from './_sections/ExploreProgramsSection';
import FAQSection from './_sections/FAQSection';
import PersonalizedCareSection from './_sections/PersonalizedCareSection';
import ProgramIntroSection from './_sections/ProgramIntroSection';
import ProgramProcessSection from './_sections/ProgramProcessSection';
import WhyChooseSaKyiSection from './_sections/WhyChooseSaKyiSection';

export const metadata: Metadata = {
  title: 'Wellness Programs | SaKyi Health & Wellness',
  description:
    'Explore SaKyi’s structured wellness programs, combining personalized assessments, smart tracking, and dedicated coaching to support safe, sustainable health changes.',
};

export default function ProgramsPage() {
  return (
    <>
      <ProgramIntroSection />

      <ExploreProgramsSection />

      <PersonalizedCareSection />

      <WhyChooseSaKyiSection />

      <ProgramProcessSection />

      <FAQSection />
    </>
  );
}
