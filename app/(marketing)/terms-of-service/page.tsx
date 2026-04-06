import type { Metadata } from 'next';

import { ScrollText } from 'lucide-react';

import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading1 from '@/components/shared/typography/Heading1';

export const metadata: Metadata = {
  title: 'Terms of Service | SaKyi Health & Wellness',
  description:
    'Read the terms and conditions governing your use of SaKyi Health & Wellness services and platform.',
};

const sections = [
  {
    title: 'Acceptance of Terms',
    content:
      'By accessing or using SaKyi Health & Wellness, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform or services.',
  },
  {
    title: 'Our Services',
    content:
      'SaKyi Health & Wellness provides personalized wellness programs, nutrition guidance, and movement planning. We reserve the right to modify or discontinue any part of our services at any time without liability.',
  },
  {
    title: 'User Accounts',
    content:
      'You are responsible for maintaining the security of your account and all activities that occur under it. Please provide accurate information when registering and notify us immediately if you suspect any unauthorized access.',
  },
  {
    title: 'Health Disclaimer',
    content:
      'The content on our platform is for informational purposes only and does not constitute medical advice. Always consult a qualified health professional before making changes to your health routine.',
  },
  {
    title: 'Payments',
    content:
      'Fees for paid programs are due at the time of enrollment and are non-refundable unless stated otherwise. We may update our pricing with reasonable notice, and continued use of a paid service constitutes acceptance of any new fees.',
  },
  {
    title: 'Acceptable Use',
    content:
      'You agree to use our platform only for lawful purposes and in a manner that does not harm other users or our services. Misuse of the platform may result in suspension or termination of your account.',
  },
  {
    title: 'Intellectual Property',
    content:
      'All content on our platform is owned by SaKyi Health & Wellness and protected by applicable law. You may not reproduce or distribute our content without written permission.',
  },
  {
    title: 'Limitation of Liability',
    content:
      'We are not liable for any indirect or consequential damages arising from your use of our services. Our total liability is limited to the amount you paid us in the preceding twelve months.',
  },
  {
    title: 'Changes to These Terms',
    content:
      'We may update these Terms of Service from time to time. Changes will be posted on this page and take effect upon posting. Continued use of our services means you accept the updated terms.',
  },
  {
    title: 'Contact Us',
    content:
      'For any questions about these Terms, please contact us at customerservice@sakyihealthandwellness.com.',
  },
];

export default function TermsOfServicePage() {
  return (
    <SectionContainer id='terms-of-service' className='bg-background'>
      <div className='mx-auto max-w-3xl'>
        {/* Hero */}
        <div className='mb-10 space-y-4 text-center'>
          <div className='flex justify-center'>
            <SectionBadge
              icon={<ScrollText className='h-4 w-4' />}
              text='Legal Agreement'
            />
          </div>
          <Heading1>
            <span className='text-foreground font-sans'>Terms of </span>
            <span className='text-brand-gradient bg-clip-text font-sans text-transparent'>
              Service
            </span>
          </Heading1>
          <Body1 className='text-muted-foreground mx-auto max-w-2xl'>
            Please read these terms carefully before using our platform. By
            continuing, you agree to the conditions outlined below.
          </Body1>
          <p className='text-muted-foreground font-sans text-sm'>
            Effective date: January 1, 2026
          </p>
        </div>

        {/* Sections */}
        <div className='divide-border divide-y'>
          {sections.map((section, index) => (
            <div key={section.title} className='py-7'>
              <h2 className='text-foreground mb-3 font-sans text-lg font-semibold'>
                {index + 1}. {section.title}
              </h2>
              <p className='text-muted-foreground font-sans text-base leading-relaxed'>
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
