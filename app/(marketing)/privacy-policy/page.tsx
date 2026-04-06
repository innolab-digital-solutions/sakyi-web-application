import type { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';

import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading1 from '@/components/shared/typography/Heading1';

export const metadata: Metadata = {
  title: 'Privacy Policy | SaKyi Health & Wellness',
  description:
    'Learn how SaKyi Health & Wellness collects, uses, and protects your personal information.',
};

const sections = [
  {
    title: 'Information We Collect',
    content:
      'We collect information you provide when you create an account or enroll in a wellness program, such as your name, email address, phone number, and health goals. We only collect what is necessary to deliver and improve our services.',
  },
  {
    title: 'How We Use Your Information',
    content:
      'We use your information to provide and personalize our services, process transactions, and communicate with you about your programs. We do not use your data for any purpose beyond what is needed to support your wellness journey.',
  },
  {
    title: 'Sharing of Information',
    content:
      'We do not sell or rent your personal information to third parties. We may share your data only with trusted service providers who help us operate our platform, and only under strict confidentiality agreements.',
  },
  {
    title: 'Data Security',
    content:
      'We apply appropriate security measures to protect your personal information from unauthorized access or disclosure. While we take every reasonable precaution, no system is entirely immune to risk, and we encourage you to keep your account credentials secure.',
  },
  {
    title: 'Your Rights',
    content:
      'You have the right to access, update, or request deletion of your personal information at any time. To make a request, please contact us and we will respond promptly.',
  },
  {
    title: 'Changes to This Policy',
    content:
      'We may update this Privacy Policy occasionally. Any changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.',
  },
  {
    title: 'Contact Us',
    content:
      'If you have any questions about this Privacy Policy, please reach out to us at customerservice@sakyihealthandwellness.com.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <SectionContainer id='privacy-policy' className='bg-background'>
      <div className='mx-auto max-w-3xl'>
        {/* Hero */}
        <div className='mb-10 space-y-4 text-center'>
          <div className='flex justify-center'>
            <SectionBadge
              icon={<ShieldCheck className='h-4 w-4' />}
              text='Your Privacy Matters'
            />
          </div>
          <Heading1>
            <span className='text-foreground font-sans'>Privacy </span>
            <span className='text-brand-gradient bg-clip-text font-sans text-transparent'>
              Policy
            </span>
          </Heading1>
          <Body1 className='text-muted-foreground mx-auto max-w-2xl'>
            We are committed to protecting your personal information and being
            transparent about how we use it.
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
