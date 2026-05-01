import type { Metadata } from 'next';

import CallToActionSection from '@/components/marketing/sections/contact/CallToActionSection';
import ConnectWithUsSection from '@/components/marketing/sections/contact/ConnectWithUsSection';
import ContactHashScroll from '@/components/marketing/sections/contact/ContactHashScroll';
import ContactIntroSection from '@/components/marketing/sections/contact/ContactIntroSection';
import OurContactDetailSection from '@/components/marketing/sections/contact/OurContactDetailSection';
import SendUsMessageSection from '@/components/marketing/sections/contact/SendUsMessageSection';

export const metadata: Metadata = {
  title: 'Contact SaKyi Health & Wellness',
  description:
    'Get in touch with SaKyi Health & Wellness to ask questions, book consultations, or learn more about our personalized wellness programs.',
};

export default function ContactPage() {
  return (
    <>
      <ContactHashScroll />

      <ContactIntroSection />

      <OurContactDetailSection />

      <ConnectWithUsSection />

      <SendUsMessageSection />

      <CallToActionSection />
    </>
  );
}
