import type { Metadata } from 'next';

import ConnectWithUsSection from '../../../components/marketing/pages/contact/ConnectWithUsSection';
import ContactHeroSection from '../../../components/marketing/pages/contact/ContactHeroSection';
import OurContactDetailSection from '../../../components/marketing/pages/contact/OurContactDetailSection';
import SendUsMessageSection from '../../../components/marketing/pages/contact/SendUsMessageSection';

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
