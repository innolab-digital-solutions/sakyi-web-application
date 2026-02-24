import ProgramIntroSection from '@/components/site/pages/programs/ProgramIntroSection';
import ExploreProgramsSection from '@/components/site/pages/programs/ExploreProgramsSection';
import PersonalizedCareSection from '@/components/site/pages/programs/PersonalizedCareSection';
import WhyChooseSaKyiSection from '@/components/site/pages/programs/WhyChooseSaKyiSection';
import ProgramProcessSection from '@/components/site/pages/programs/ProgramProcessSection';
import FAQSection from '@/components/site/pages/programs/FAQSection';

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
