import { ScrollText } from 'lucide-react';
import type { Metadata } from 'next';

import LegalDocument from '@/components/marketing/legal/LegalDocument';
import { ROUTES } from '@/config/routes';
import { loadLegalDocument } from '@/lib/legal/load-legal-document';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Terms of Service',
  description:
    'Read the Terms of Service governing access to and use of Sa Kyi Health & Wellness programs, website, and mobile application.',
  path: ROUTES.MARKETING.TERMS_OF_SERVICE,
});

export default async function TermsOfServicePage() {
  const document = await loadLegalDocument('termsOfService');

  return (
    <LegalDocument
      document={document}
      sectionId='terms-of-service'
      badgeIcon={ScrollText}
      badgeText='Legal Agreement'
      titleLead='Terms of'
      titleAccent='Service'
      intro='These Terms of Service explain the rules and conditions for accessing and using Sa Kyi Health & Wellness services, including our website, mobile application, and wellness programs.'
      notice='By creating an account, using our platform, requesting program enrollment, or participating in a Sa Kyi program, you agree to these Terms. If you do not agree, please discontinue using the relevant services.'
      contactTitle='Questions about these terms?'
      contactDescription='Our team is available to clarify any aspect of our Terms of Service.'
      contactEmail='contact@sakyihealthandwellness.com'
    />
  );
}
