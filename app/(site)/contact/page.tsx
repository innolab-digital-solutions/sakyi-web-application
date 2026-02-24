import ContactHeroSection from '@/components/site/pages/contact/ContactHeroSection';
import OurContactDetailSection from '@/components/site/pages/contact/OurContactDetailSection';
import ConnectWithUsSection from '@/components/site/pages/contact/ConnectWithUsSection';
import SendUsMessageSection from '@/components/site/pages/contact/SendUsMessageSection';

export default function ContactPage() {
  return (
    <>
      <ContactHeroSection />

      <OurContactDetailSection />

      <ConnectWithUsSection />

      <SendUsMessageSection />
    </>
  );
}
