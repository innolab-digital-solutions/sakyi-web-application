import type { Metadata } from 'next';

import ExploreProgramsSection from '@/components/site/pages/programs/ExploreProgramsSection';
import FAQSection from '@/components/site/pages/programs/FAQSection';
import PersonalizedCareSection from '@/components/site/pages/programs/PersonalizedCareSection';
import ProgramIntroSection from '@/components/site/pages/programs/ProgramIntroSection';
import ProgramProcessSection from '@/components/site/pages/programs/ProgramProcessSection';
import WhyChooseSaKyiSection from '@/components/site/pages/programs/WhyChooseSaKyiSection';

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
