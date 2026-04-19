import type { Metadata } from 'next';

import CallToActionSection from '@/components/marketing/sections/programs/CallToActionSection';
import ExploreProgramsSection from '@/components/marketing/sections/programs/ExploreProgramsSection';
import FAQSection from '@/components/marketing/sections/programs/FAQSection';
import HowItWorks from '@/components/marketing/sections/programs/HowItWorks';
import PersonalizedCareSection from '@/components/marketing/sections/programs/PersonalizedCareSection';
import ProgramIntroSection from '@/components/marketing/sections/programs/ProgramIntroSection';
import ProgramsHashScroll from '@/components/marketing/sections/programs/ProgramsHashScroll';
import WhyChooseSaKyiSection from '@/components/marketing/sections/programs/WhyChooseSaKyiSection';

export const metadata: Metadata = {
  title: 'Wellness Programs | SaKyi Health & Wellness',
  description:
    'Explore SaKyi’s structured wellness programs, combining personalized assessments, smart tracking, and dedicated coaching to support safe, sustainable health changes.',
};

export default function ProgramsPage() {
  return (
    <>
      <ProgramsHashScroll />

      <ProgramIntroSection />

      <ExploreProgramsSection />

      <PersonalizedCareSection />

      <WhyChooseSaKyiSection />

      <HowItWorks />

      <FAQSection />

      <CallToActionSection />
    </>
  );
}
