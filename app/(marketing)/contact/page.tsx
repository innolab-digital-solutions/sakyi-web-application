import type { Metadata } from 'next';

import CallToActionSection from '@/components/marketing/sections/CallToActionSection';
import ConnectWithUsSection from '@/components/marketing/sections/contact/ConnectWithUsSection';
import ContactHashScroll from '@/components/marketing/sections/contact/ContactHashScroll';
import ContactIntroSection from '@/components/marketing/sections/contact/ContactIntroSection';
import OurContactDetailSection from '@/components/marketing/sections/contact/OurContactDetailSection';
import SendUsMessageSection from '@/components/marketing/sections/contact/SendUsMessageSection';
import { ROUTES } from '@/config/routes';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: { absolute: 'Contact SaKyi Health & Wellness' },
  description:
    'Get in touch with SaKyi Health & Wellness to ask questions, book consultations, or learn more about our personalized wellness programs.',
  path: ROUTES.MARKETING.CONTACT,
});

export default function ContactPage() {
  return (
    <>
      <ContactHashScroll />

      <ContactIntroSection />

      <OurContactDetailSection />

      <ConnectWithUsSection />

      <SendUsMessageSection />

      <CallToActionSection
        id='contact-cta-section'
        translationPrefix='marketing.pages.contact.call-to-action'
        secondaryHref={ROUTES.MARKETING.ABOUT}
      />
    </>
  );
}
