import { ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

import LegalDocument from '@/components/marketing/legal/LegalDocument';
import { ROUTES } from '@/config/routes';
import { loadLegalDocument } from '@/lib/legal/load-legal-document';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Privacy Policy',
  description:
    'Learn how Sa Kyi Health & Wellness collects, uses, stores, shares, and protects your personal information.',
  path: ROUTES.MARKETING.PRIVACY_POLICY,
});

export default async function PrivacyPolicyPage() {
  const document = await loadLegalDocument('privacyPolicy');

  return (
    <LegalDocument
      document={document}
      sectionId='privacy-policy'
      badgeIcon={ShieldCheck}
      badgeText='Your Privacy Matters'
      titleLead='Privacy'
      titleAccent='Policy'
      intro='Sa Kyi Health & Wellness respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, share, and protect your information.'
      notice='By creating an account, submitting information, requesting program enrollment, or participating in a Sa Kyi program, you acknowledge this Privacy Policy. Where applicable law requires specific consent, we will request that consent separately.'
      contactTitle='Questions about your privacy?'
      contactDescription='Our team is here to help with any data-related inquiries.'
      contactEmail='contact@sakyihealthandwellness.com'
    />
  );
}
