import { FileText, Lock, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

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
    number: '1.1',
    title: 'About Sa Kyi Health & Wellness',
    content:
      'Sa Kyi Health & Wellness is a lifestyle modification platform designed to support individuals in building healthier daily habits through structured tracking, expert guidance, and personalized feedback. We operate as a private digital wellness service not a clinical or medical institution. All wellness guidance provided through our platform is lifestyle-focused and does not constitute any form of clinical treatment.',
  },
  {
    number: '1.2',
    title: 'Information We Collect',
    content:
      'To deliver a tailored wellness experience, Sa Kyi collects the following categories of information:',
    bullets: [
      {
        label: 'Personal Identification Data',
        text: 'Full name, date of birth, gender, email address, and phone number. This information is used to create and manage your Sa Kyi account.',
      },
      {
        label: 'Health & Wellness Profile',
        text: 'Lifestyle goals (e.g., weight management, energy improvement, holistic wellness), self-reported metabolic concerns, mobility considerations, and any personal wellness preferences you choose to share. This information is used exclusively to personalize your program.',
      },
      {
        label: 'Daily Tracking Data',
        text: 'Water intake logs, meal photographs, physical activity records (step counts, exercise sessions), mood entries, and sleep pattern data submitted through the application on a daily basis.',
      },
      {
        label: 'Authentication Data',
        text: 'If you choose to sign in using Google OAuth, we receive limited authentication tokens from Google to verify your identity securely. We do not store your Google password.',
      },
      {
        label: 'Device & Technical Data',
        text: 'Device type, operating system version, app version, and general usage analytics collected to improve application performance and user experience.',
      },
    ],
  },
  {
    number: '1.3',
    title: 'How We Use Your Information',
    content: 'Your information is used strictly for the following purposes:',
    bullets: [
      {
        text: 'To assign you to a personalized three-person support team and enable them to deliver your weekly lifestyle modification program.',
      },
      {
        text: 'To allow your Technical Lifestyle Expert to review your daily tracking data and generate your weekly progress report and instruction set.',
      },
      {
        text: 'To facilitate communication between you and your Communication Coordinator regarding your program updates, schedule, and queries.',
      },
      {
        text: 'To allow your Data Coordinator to verify data accuracy, maintain records, and generate weekly summary reports.',
      },
      {
        text: 'To improve the overall functionality, content, and user experience of the Sa Kyi platform based on aggregated, anonymized usage data.',
      },
      {
        text: 'To send you service-related notifications such as reminders, report availability alerts, and important platform announcements.',
      },
    ],
  },
  {
    number: '1.4',
    title: 'Your Support Team & Data Access',
    content:
      'Upon enrollment in a Sa Kyi lifestyle program, you are assigned a dedicated support team. Your personal and health data is accessible only to this team and relevant administrative staff within Sa Kyi. The roles within your support team are as follows:',
    numbered: [
      {
        label: 'Technical Lifestyle Expert',
        text: 'Reviews your daily tracking logs, analyzes trends in your submitted data, and produces your weekly instruction sheet in PDF or video format. This team member provides all lifestyle feedback and guidance.',
      },
      {
        label: 'Communication Coordinator',
        text: 'Serves as your primary point of contact for scheduling, program queries, updates, and general support communication via the platform or designated communication channels.',
      },
      {
        label: 'Data Coordinator',
        text: 'Responsible for data verification, record-keeping, quality assurance of submitted logs, and the generation of structured progress reports.',
      },
    ],
    footer:
      'No other Sa Kyi staff member, contractor, or third party has access to your personal health data without your explicit written consent.',
  },
  {
    number: '1.5',
    title: 'Photographs & Media',
    content:
      'Photographs uploaded to the Sa Kyi application — including meal logs and physical progress images — are stored in an encrypted, access-controlled environment. These images are accessible only to your assigned Technical Lifestyle Expert and relevant Data Coordinator for coaching and analysis purposes.',
    bullets: [
      {
        text: 'Your photographs will never be used in marketing materials, social media, or public-facing content without your explicit written consent.',
      },
      {
        text: 'You may request the removal of any uploaded media at any time by contacting our support team.',
      },
      {
        text: 'Images are retained only for the duration of your active program plus 30 days, after which they are permanently deleted unless you have granted extended consent.',
      },
    ],
  },
  {
    number: '1.6',
    title: 'Data Security',
    content:
      'Sa Kyi employs industry-standard technical and organizational security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. These measures include:',
    bullets: [
      {
        text: 'Encrypted data transmission using HTTPS/TLS protocols for all data exchanges between the application and our servers.',
      },
      {
        text: 'Secure, access-controlled server environments with restricted administrative access.',
      },
      {
        text: 'Regular security reviews and vulnerability assessments of our platform infrastructure.',
      },
      {
        text: 'Strict internal data access policies ensuring that only authorized team members can view your data.',
      },
    ],
    footer:
      'While we take all reasonable precautions to protect your data, no digital system can guarantee absolute security. In the event of a data breach that may affect your personal information, Sa Kyi will notify you as required by applicable data protection laws.',
  },
  {
    number: '1.7',
    title: 'Third-Party Services & Disclosure',
    content:
      'Sa Kyi does not sell, rent, trade, or share your personal health data with third-party advertisers, marketing agencies, or data brokers under any circumstances.',
    paragraphs: [
      'We may engage trusted third-party service providers strictly to support our platform operations (e.g., cloud hosting, secure data storage). These providers are bound by confidentiality agreements and are permitted to process your data only as instructed by Sa Kyi and to the extent necessary to deliver the service.',
      'We may disclose your information only when legally required to do so by applicable law, court order, or regulatory authority.',
    ],
  },
  {
    number: '1.8',
    title: 'Data Retention',
    content:
      'We retain your personal data for as long as your Sa Kyi account remains active and for a reasonable period thereafter to fulfill our legal and operational obligations. Specific retention periods are as follows:',
    bullets: [
      {
        label: 'Active account data',
        text: 'Retained for the full duration of your membership.',
      },
      {
        label: 'Program tracking data and reports',
        text: 'Retained for 12 months from the date of generation, unless you request earlier deletion.',
      },
      {
        label: 'Uploaded photographs and media',
        text: 'Retained for the duration of the active program plus 30 days.',
      },
      {
        label: 'Deleted account data',
        text: 'Permanently purged from all systems within 7 business days of a verified deletion request.',
      },
    ],
  },
  {
    number: '1.9',
    title: 'Your Rights & Data Portability',
    content:
      'In accordance with internationally recognized privacy standards, including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), Sa Kyi recognizes the following user rights:',
    bullets: [
      {
        label: 'Right to Access',
        text: 'You may request a copy of the personal data Sa Kyi holds about you at any time.',
      },
      {
        label: 'Right to Rectification',
        text: 'You may request correction of any inaccurate or incomplete personal data.',
      },
      {
        label: 'Right to Erasure',
        text: 'You may request the deletion of your account and all associated data via the Settings menu in the app or by contacting our support team directly.',
      },
      {
        label: 'Right to Data Portability',
        text: 'You may request a structured, machine-readable export of your data.',
      },
      {
        label: 'Right to Object',
        text: 'You may object to the processing of your data for any purpose beyond the delivery of your program.',
      },
    ],
    footer:
      'All data-related requests will be acknowledged within 3 business days and completed within 7 business days. To submit a request, contact: support@sakyi.com',
  },
  {
    number: '1.10',
    title: 'Policy Updates',
    content:
      'Sa Kyi reserves the right to update this Privacy Policy periodically to reflect changes in our services, legal requirements, or operational practices. In the event of material changes, we will notify active users through the application or via email at least 14 days before the changes take effect. Continued use of the platform after the effective date of any updated policy constitutes your acceptance of the revised terms.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <SectionContainer id='privacy-policy' className='bg-background'>
      <div className='mx-auto max-w-4xl'>
        {/* Hero */}
        <div className='mb-12 space-y-5 text-center'>
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
            Sa Kyi Health &amp; Wellness values the trust our members place in
            us. This Privacy Policy explains how we collect, use, store,
            protect, and manage your personal information when you use the Sa
            Kyi mobile application.
          </Body1>

          {/* Meta pills */}
          <div className='flex flex-wrap items-center justify-center gap-3 pt-2'>
            <span className='bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-xs font-medium'>
              <FileText className='h-3.5 w-3.5' />
              Effective Date: April 2026
            </span>
            <span className='bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-xs font-medium'>
              <Lock className='h-3.5 w-3.5' />
              Version 1.0
            </span>
          </div>
        </div>

        {/* Intro notice */}
        <div className='border-brand-gradient bg-muted/40 mb-10 rounded-2xl border-l-4 p-5'>
          <p className='text-muted-foreground font-sans text-sm leading-relaxed'>
            By registering and using our services, you agree to the practices
            described in this document. Please read this policy carefully before
            using the Sa Kyi platform.
          </p>
        </div>

        {/* Sections */}
        <div className='space-y-2'>
          {sections.map((section) => (
            <div
              key={section.number}
              className='border-border rounded-2xl border bg-white p-7 shadow-sm'
            >
              {/* Section header */}
              <div className='mb-4 flex items-start gap-3'>
                <span className='bg-brand-gradient mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-sans text-xs font-bold text-white'>
                  {section.number.split('.')[1]}
                </span>
                <div>
                  <p className='text-muted-foreground font-sans text-xs font-medium tracking-widest uppercase'>
                    Section {section.number}
                  </p>
                  <h2 className='text-foreground font-sans text-lg leading-snug font-semibold'>
                    {section.title}
                  </h2>
                </div>
              </div>

              {/* Main paragraph */}
              {section.content && (
                <p className='text-muted-foreground mb-4 font-sans text-sm leading-relaxed'>
                  {section.content}
                </p>
              )}

              {/* Bullet list */}
              {'bullets' in section && section.bullets && (
                <ul className='space-y-3'>
                  {section.bullets.map((item, i) => (
                    <li key={i} className='flex gap-3'>
                      <span className='bg-brand-gradient mt-2 h-1.5 w-1.5 shrink-0 rounded-full' />
                      <p className='text-muted-foreground font-sans text-sm leading-relaxed'>
                        {'label' in item && item.label ? (
                          <>
                            <span className='text-foreground font-semibold'>
                              {item.label}:
                            </span>{' '}
                            {item.text}
                          </>
                        ) : (
                          item.text
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              {/* Numbered list */}
              {'numbered' in section && section.numbered && (
                <ol className='space-y-4'>
                  {section.numbered.map((item, i) => (
                    <li key={i} className='flex gap-3'>
                      <span className='border-border text-muted-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-sans text-xs font-semibold'>
                        {i + 1}
                      </span>
                      <p className='text-muted-foreground font-sans text-sm leading-relaxed'>
                        <span className='text-foreground font-semibold'>
                          {item.label}
                        </span>{' '}
                        — {item.text}
                      </p>
                    </li>
                  ))}
                </ol>
              )}

              {/* Extra paragraphs */}
              {'paragraphs' in section && section.paragraphs && (
                <div className='mt-4 space-y-3'>
                  {section.paragraphs.map((para, i) => (
                    <p
                      key={i}
                      className='text-muted-foreground font-sans text-sm leading-relaxed'
                    >
                      {para}
                    </p>
                  ))}
                </div>
              )}

              {/* Footer note */}
              {'footer' in section && section.footer && (
                <p className='text-muted-foreground/80 border-border mt-5 border-t pt-4 font-sans text-xs leading-relaxed italic'>
                  {section.footer}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Bottom contact card */}
        <div className='bg-brand-gradient mt-10 rounded-2xl p-px'>
          <div className='rounded-2xl bg-white p-6 text-center'>
            <ShieldCheck className='mx-auto mb-3 h-8 w-8 text-[#35bec5]' />
            <h3 className='text-foreground mb-1 font-sans text-base font-semibold'>
              Questions about your privacy?
            </h3>
            <p className='text-muted-foreground mb-4 font-sans text-sm'>
              Our team is here to help with any data-related inquiries.
            </p>
            <a
              href='mailto:customerservice@sakyihealthandwellness.com'
              className='bg-brand-gradient inline-flex items-center rounded-full px-5 py-2.5 font-sans text-sm font-semibold text-white shadow transition-all duration-300 hover:scale-105 hover:shadow-md'
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
