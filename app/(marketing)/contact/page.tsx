import type { Metadata } from 'next';

import ConnectWithUsSection from './_sections/ConnectWithUsSection';
import ContactHeroSection from './_sections/ContactHeroSection';
import OurContactDetailSection from './_sections/OurContactDetailSection';
import SendUsMessageSection from './_sections/SendUsMessageSection';

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
