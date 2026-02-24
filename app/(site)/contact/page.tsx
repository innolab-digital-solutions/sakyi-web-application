import type { Metadata } from 'next';
import ContactHeroSection from '@/components/site/pages/contact/ContactHeroSection';
import OurContactDetailSection from '@/components/site/pages/contact/OurContactDetailSection';
import ConnectWithUsSection from '@/components/site/pages/contact/ConnectWithUsSection';
import SendUsMessageSection from '@/components/site/pages/contact/SendUsMessageSection';

export const metadata: Metadata = {
  title: 'Contact SaKyi Health & Wellness',
  description:
    'Get in touch with SaKyi Health & Wellness to ask questions, book consultations, or learn more about our personalized wellness programs.',
};

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
