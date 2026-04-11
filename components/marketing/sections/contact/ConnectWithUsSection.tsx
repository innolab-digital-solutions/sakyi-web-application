'use client';

import {
  Facebook,
  Instagram,
  MessageCircle,
  Music2,
  Youtube,
} from 'lucide-react';

import SocialChannelCard from '@/components/marketing/cards/SocialChannelCard';
import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading2 from '@/components/shared/typography/Heading2';
import { useLanguage } from '@/context/LanguageContext';

const ConnectWithUsSection = () => {
  const { language, translate } = useLanguage();

  const socialChannels = [
    {
      icon: <Facebook className='h-6 w-6 text-white' />,
      title: 'Facebook',
      description: 'Follow us on Facebook',
      username: 'sakyihealthandwellness',
      link: 'https://www.facebook.com/sakyihealthandwellness',
    },
    {
      icon: <Instagram className='h-6 w-6 text-white' />,
      title: 'Instagram',
      description: 'Follow us on Instagram',
      username: 'sakyihealthandwellness',
      link: 'https://www.instagram.com/sakyihealthandwellness',
    },
    {
      icon: <Youtube className='h-6 w-6 text-white' />,
      title: 'YouTube',
      description: 'Follow us on YouTube',
      username: 'sakyihealthandwellness',
      link: 'https://www.youtube.com/@sakyihealthandwellness',
    },
    {
      icon: <Music2 className='h-6 w-6 text-white' />,
      title: 'TikTok',
      description: 'Follow us on TikTok',
      username: 'sakyihealthandwellness',
      link: 'https://www.tiktok.com/@sakyihealthandwellness',
    },
  ];

  return (
    <SectionContainer id='connect-with-us-section' className='bg-white'>
      {/* Section Header: Badge, headline, supporting summary */}
      <div
        className='flex min-w-0 flex-col items-center justify-center space-y-6'
        data-aos='fade-up'
      >
        {/* Social Channels Badge */}
        <SectionBadge
          icon={<MessageCircle className='h-4 w-4' />}
          text={translate('marketing.pages.contact.social-channels.badge')}
        />

        {/* Section Title with black and gradient parts */}
        <Heading2 lang={language} className='mx-auto text-center'>
          <span className='text-foreground'>
            {translate(
              'marketing.pages.contact.social-channels.title.black',
            )}{' '}
          </span>
          <span className='text-brand-gradient bg-clip-text text-transparent'>
            {translate(
              'marketing.pages.contact.social-channels.title.gradient',
            )}
          </span>
        </Heading2>

        {/* Supporting Description */}
        <Body1 lang={language} className='mx-auto max-w-2xl text-center'>
          {translate('marketing.pages.contact.social-channels.description')}
        </Body1>
      </div>

      {/* Social Channels Grid */}
      <div className='mt-12 grid min-w-0 gap-6 md:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-8'>
        {socialChannels.map((channel, index) => (
          <div key={index} data-aos='fade-up' data-aos-delay={`${index * 100}`}>
            <SocialChannelCard
              title={channel.title}
              description={channel.description}
              icon={channel.icon}
              username={channel.username}
              link={channel.link}
            />
          </div>
        ))}
      </div>
    </SectionContainer>
  );
};

export default ConnectWithUsSection;
