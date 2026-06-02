import { Scale, ScrollText } from 'lucide-react';
import type { Metadata } from 'next';

import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading1 from '@/components/shared/typography/Heading1';

export const metadata: Metadata = {
  title: 'Terms & Conditions | SaKyi Health & Wellness',
  description:
    'Read the terms and conditions governing your access to and use of the Sa Kyi Health & Wellness mobile application.',
};

const sections = [
  {
    number: '2.1',
    title: 'User Classification',
    content:
      'Sa Kyi operates with two distinct user categories, each with different levels of access and responsibilities:',
    bullets: [
      {
        label: 'Explore Users',
        text: 'Individuals who have downloaded and registered on the Sa Kyi platform but have not yet enrolled in a paid lifestyle modification program. Explore Users may access the public newsfeed, browse program descriptions, view general wellness content, and use selected basic wellness tools and features, while advanced personalized tracking tools and expert coaching services are available only to enrolled program members.',
      },
      {
        label: 'Program Members',
        text: 'Individuals who have been formally enrolled and approved by Sa Kyi Administration into a specific lifestyle modification track. Program Members have full access to daily tracking features, weekly expert feedback, communication with their support team, and access to their personal progress dashboard.',
      },
    ],
  },
  {
    number: '2.2',
    title: 'Enrollment & Program Access',
    content:
      'Enrollment as a Program Member is subject to administrative review and approval by Sa Kyi. Sa Kyi reserves the right to accept, defer, or decline any enrollment application at its sole discretion. Upon successful enrollment, Program Members will be notified and assigned to their dedicated support team.',
    paragraphs: [
      'Sa Kyi programs are designed for individuals seeking lifestyle improvement and habit modification. Enrollment does not establish a clinical relationship of any kind. All program activities are voluntary, and the member retains full autonomy over their personal health decisions.',
    ],
  },
  {
    number: '2.3',
    title: 'The 7-Day Service Cycle',
    content:
      "Sa Kyi's core service is delivered on a structured 7-day tracking cycle. By enrolling as a Program Member, you agree to the following:",
    numbered: [
      {
        text: 'Consistent daily logging of all assigned tracking data including but not limited to meals, water intake, physical activity, mood, and sleep from Day 1 through Day 7 of each cycle.',
      },
      {
        text: 'Submission of accurate and complete data for each tracking category. Incomplete or inaccurate logs may affect the quality and relevance of your weekly feedback.',
      },
      {
        text: 'On Day 8 (designated Report Day), your Technical Lifestyle Expert will review the submitted data and issue a comprehensive weekly summary report, along with a new personalized instruction set for the following cycle.',
      },
      {
        text: 'Failure to complete the tracking cycle due to user inaction does not entitle the member to a service refund or cycle extension.',
      },
    ],
  },
  {
    number: '2.4',
    title: 'External Payment Policy',
    content:
      'Sa Kyi is a lifestyle service and tracking platform. The Sa Kyi mobile application does not process, handle, or facilitate any financial transactions internally. There are no in-app purchases, in-app subscriptions, or payment gateways within the application itself.',
    bullets: [
      {
        text: 'All program enrollment fees, renewal payments, and marketplace transactions are handled exclusively through external channels including bank transfer, direct billing, or agreed-upon communication methods (e.g., Viber, email).',
      },
      {
        text: 'All payment arrangements, amounts, and schedules are agreed upon directly between the member and Sa Kyi Administration prior to enrollment.',
      },
      {
        text: 'Sa Kyi is not responsible for any payment disputes, banking errors, transaction delays, or financial losses arising from external payment methods or third-party banking services.',
      },
      {
        text: 'Members are advised to retain proof of all payments made to Sa Kyi for their own records.',
      },
    ],
  },
  {
    number: '2.5',
    title: 'User Conduct & Platform Integrity',
    content:
      'To ensure the quality, fairness, and effectiveness of the Sa Kyi platform for all members, users agree to the following standards of conduct:',
    bullets: [
      {
        text: 'You will provide truthful, accurate, and complete information in all tracking logs and profile submissions.',
      },
      {
        text: 'You will not misrepresent your health condition, progress, or activities in any manner that could mislead your support team.',
      },
      {
        text: 'You will not reproduce, distribute, share, sell, or otherwise disclose expert-generated instruction sheets, reports, or proprietary program content to any non-member individual or third party. Such content is the intellectual property of Sa Kyi and is licensed exclusively for your personal use.',
      },
      {
        text: 'You will not use the Sa Kyi platform for any unlawful, harmful, or fraudulent purpose.',
      },
      {
        text: 'You will treat all Sa Kyi support team members with courtesy and professionalism in all communications.',
      },
    ],
    footer:
      'Violations of these conduct standards may result in immediate suspension or termination of your account without prior notice and without entitlement to a refund of any fees paid.',
  },
  {
    number: '2.6',
    title: 'Intellectual Property',
    content:
      'All content available on the Sa Kyi platform including but not limited to text, graphics, logos, application design, weekly instruction materials, video content, program frameworks, and proprietary methodologies is the exclusive intellectual property of Sa Kyi Health & Wellness and is protected by applicable copyright and intellectual property laws.',
    paragraphs: [
      'Users are granted a limited, non-exclusive, non-transferable license to access and use Sa Kyi content solely for personal, non-commercial wellness purposes within the scope of their enrollment. This license does not grant any right to reproduce, distribute, publicly display, or create derivative works from Sa Kyi content.',
    ],
  },
  {
    number: '2.7',
    title: 'Technical Requirements & Connectivity',
    content:
      'The Sa Kyi platform requires a stable internet connection for data synchronization, report delivery, and communication features. Sa Kyi is not responsible for:',
    bullets: [
      {
        text: "Loss of tracking data caused by connectivity failures on the user's end.",
      },
      {
        text: "Missed or delayed weekly reports resulting from the user's failure to sync data within the designated tracking cycle.",
      },
      {
        text: "Application performance issues arising from the user's device specifications, operating system limitations, or third-party software conflicts.",
      },
    ],
    footer:
      'Users are advised to ensure their application is kept up to date to maintain full functionality and access to the latest features and security improvements.',
  },
  {
    number: '2.8',
    title: 'Modifications to Services & Terms',
    content:
      'Sa Kyi reserves the right to modify, update, suspend, or discontinue any aspect of its services, program offerings, or platform features at any time. Where material changes are made to these Terms & Conditions, Sa Kyi will provide advance notice through the application or by email.',
    paragraphs: [
      'Your continued use of the Sa Kyi platform following any posted update to these Terms & Conditions constitutes your acceptance of the revised terms. If you do not agree to the updated terms, you may discontinue use of the platform and request account deletion.',
    ],
  },
  {
    number: '2.9',
    title: 'Termination of Access',
    content:
      'Sa Kyi reserves the right to suspend or permanently terminate any user account that is found to be in violation of these Terms & Conditions, or where continued access is deemed contrary to the safety, integrity, or operational interests of the Sa Kyi platform.',
    paragraphs: [
      'Users may voluntarily close their account at any time by submitting a deletion request through the Settings menu of the application or by contacting the Sa Kyi support team directly. Voluntary account closure does not entitle the user to a refund of any fees already paid for an active program cycle.',
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <SectionContainer id='terms-of-service' className='bg-background'>
      <div className='mx-auto max-w-4xl'>
        {/* Hero */}
        <div className='mb-12 space-y-5 text-center'>
          <div className='flex justify-center'>
            <SectionBadge
              icon={<ScrollText className='h-4 w-4' />}
              text='Legal Agreement'
            />
          </div>
          <Heading1>
            <span className='text-foreground font-sans'>Terms &amp; </span>
            <span className='text-brand-gradient bg-clip-text font-sans text-transparent'>
              Conditions
            </span>
          </Heading1>
          <Body1 className='text-muted-foreground mx-auto max-w-2xl'>
            These Terms &amp; Conditions govern your access to and use of the Sa
            Kyi Health &amp; Wellness mobile application. Please read them
            carefully before proceeding.
          </Body1>

        </div>

        {/* Intro notice */}
        <div className='border-brand-gradient bg-muted/40 mb-10 rounded-2xl border-l-4 p-5'>
          <p className='text-muted-foreground font-sans text-sm leading-relaxed'>
            By creating an account or accessing any feature of Sa Kyi, you agree
            to be bound by these terms in their entirety. If you do not agree,
            please discontinue use of the platform.
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
                        {item.text}
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
            <Scale className='mx-auto mb-3 h-8 w-8 text-[#35bec5]' />
            <h3 className='text-foreground mb-1 font-sans text-base font-semibold'>
              Questions about these terms?
            </h3>
            <p className='text-muted-foreground mb-4 font-sans text-sm'>
              Our team is available to clarify any aspect of our Terms &amp;
              Conditions.
            </p>
            <a
              href='mailto:operation@sakyihealthandwellness.com'
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
