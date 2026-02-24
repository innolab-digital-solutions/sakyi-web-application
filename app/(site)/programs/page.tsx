import type { Metadata } from 'next';
import ProgramIntroSection from '@/components/site/pages/programs/ProgramIntroSection';
import ExploreProgramsSection from '@/components/site/pages/programs/ExploreProgramsSection';
import PersonalizedCareSection from '@/components/site/pages/programs/PersonalizedCareSection';
import WhyChooseSaKyiSection from '@/components/site/pages/programs/WhyChooseSaKyiSection';
import ProgramProcessSection from '@/components/site/pages/programs/ProgramProcessSection';
import FAQSection from '@/components/site/pages/programs/FAQSection';

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
