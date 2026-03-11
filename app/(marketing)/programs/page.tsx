import type { Metadata } from 'next';

import ExploreProgramsSection from '@/components/marketing/sections/programs/ExploreProgramsSection';
import FAQSection from '@/components/marketing/sections/programs/FAQSection';
import PersonalizedCareSection from '@/components/marketing/sections/programs/PersonalizedCareSection';
import ProgramIntroSection from '@/components/marketing/sections/programs/ProgramIntroSection';
import ProgramProcessSection from '@/components/marketing/sections/programs/ProgramProcessSection';
import WhyChooseSaKyiSection from '@/components/marketing/sections/programs/WhyChooseSaKyiSection';

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
