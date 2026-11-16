import { AlertTriangle } from 'lucide-react';
import type { Metadata } from 'next';

import LegalDocument from '@/components/marketing/legal/LegalDocument';
import { ROUTES } from '@/config/routes';
import { loadLegalDocument } from '@/lib/legal/load-legal-document';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Health & Wellness Disclaimer',
  description:
    'Read the Sa Kyi Health & Wellness disclaimer covering wellness programs, care plans, exercise, nutrition, and medical advice limitations.',
  path: ROUTES.MARKETING.DISCLAIMER,
});

export default async function DisclaimerPage() {
  const document = await loadLegalDocument('disclaimer');

  return (
    <LegalDocument
      document={document}
      sectionId='disclaimer'
      badgeIcon={AlertTriangle}
      badgeText='Important Notice'
      titleLead='Health & Wellness'
      titleAccent='Disclaimer'
      intro='This disclaimer explains important limitations of Sa Kyi Health & Wellness programs, care plans, and related wellness guidance.'
      notice='Although our care team may include healthcare professionals, our wellness programs are not a substitute for a complete medical examination, diagnosis, medical treatment, or ongoing care from your personal healthcare provider.'
      contactTitle='Questions about this disclaimer?'
      contactDescription='Contact us if you have questions about this Health & Wellness Disclaimer or our wellness programs.'
      contactEmail='contact@sakyihealthandwellness.com'
    />
  );
}
