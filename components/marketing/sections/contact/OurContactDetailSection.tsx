'use client';

import { Clock, Globe, Mail, MessageCircle, Phone } from 'lucide-react';

import ContactCard from '@/components/marketing/cards/ContactCard';
import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading2 from '@/components/shared/typography/Heading2';
import { useLanguage } from '@/context/LanguageContext';

const OurContactDetailSection = () => {
  const { language, translate } = useLanguage();

  const t = (key: string) =>
    translate(`marketing.pages.contact.contact-details.details.${key}`);

  // Copy comes from the dictionary so it follows the active language; the link
  // targets are fixed addresses, so they live here rather than being translated.
  const contactDetails = [
    {
      icon: <Mail className='h-6 w-6 text-white' />,
      title: t('email.title'),
      description: t('email.description'),
      value: t('email.value'),
      href: 'mailto:customerservice@sakyihealthandwellness.com',
    },
    {
      icon: <Phone className='h-6 w-6 text-white' />,
      title: t('phone.title'),
      description: t('phone.description'),
      value: t('phone.value'),
      href: 'tel:+959250357339',
    },
    {
      icon: <Globe className='h-6 w-6 text-white' />,
      title: t('remote-care.title'),
      description: t('remote-care.description'),
      value: t('remote-care.value'),
      href: 'https://www.sakyihealthandwellness.com',
    },
    {
      icon: <Clock className='h-6 w-6 text-white' />,
      title: t('support-hours.title'),
      description: t('support-hours.description'),
      value: t('support-hours.value'),
      // Opening hours aren't actionable, so no link.
    },
  ];
  return (
    <SectionContainer id='our-contact-detail-section' className='bg-white'>
      {/* Section Header: Badge, headline, supporting summary */}
      <div
        className='flex min-w-0 flex-col items-center justify-center space-y-6'
        data-aos='fade-up'
      >
        {/* Contact Details Badge */}
        <SectionBadge
          icon={<MessageCircle className='h-4 w-4' />}
          text={translate('marketing.pages.contact.contact-details.badge')}
        />

        {/* Section Title with black and gradient parts */}
        <Heading2 lang={language} className='mx-auto text-center'>
          <span className='text-foreground'>
            {translate(
              'marketing.pages.contact.contact-details.title.black',
            )}{' '}
          </span>
          <span className='text-brand-gradient bg-clip-text text-transparent'>
            {translate(
              'marketing.pages.contact.contact-details.title.gradient',
            )}
          </span>
        </Heading2>

        {/* Supporting Description */}
        <Body1 lang={language} className='mx-auto max-w-2xl text-center'>
          {translate('marketing.pages.contact.contact-details.description')}
        </Body1>
      </div>

      <div className='mt-12 grid min-w-0 gap-6 lg:mt-16 lg:auto-rows-fr lg:grid-cols-2 lg:gap-8'>
        {contactDetails.map((detail, index) => (
          <div
            key={index}
            className='h-full min-w-0'
            data-aos='fade-up'
            data-aos-delay={`${index * 100}`}
          >
            <ContactCard
              title={detail.title}
              description={detail.description}
              icon={detail.icon}
              value={detail.value}
              href={detail.href}
            />
          </div>
        ))}
      </div>
    </SectionContainer>
  );
};

export default OurContactDetailSection;
