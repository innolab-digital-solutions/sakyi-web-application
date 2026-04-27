'use client';
import { Facebook, Linkedin, Mail, Music2, Youtube, Zap } from 'lucide-react';
import Image from 'next/image';

import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading2 from '@/components/shared/typography/Heading2';
import { useLanguage } from '@/context/LanguageContext';

import SectionBadge from '../../SectionBadge';

const OurExpertTeamSection = () => {
  const { language, translate } = useLanguage();

  const teamMembers = [
    {
      name: translate('marketing.pages.about.our-team.members.founder.name'),
      role: translate('marketing.pages.about.our-team.members.founder.role'),
      bio: translate('marketing.pages.about.our-team.members.founder.bio'),
      image: '/images/founder-kyawhtin.jpg',
      quote: translate('marketing.pages.about.our-team.members.founder.quote'),
      socials: {
        linkedin: 'https://www.linkedin.com/in/kyaw-htin-86b0ba144/',
        email: '',
        tiktok: '',
        facebook: '',
        youtube: '',
      },
    },
    {
      name: translate(
        'marketing.pages.about.our-team.members.technical-director.name',
      ),
      role: translate(
        'marketing.pages.about.our-team.members.technical-director.role',
      ),
      bio: translate(
        'marketing.pages.about.our-team.members.technical-director.bio',
      ),
      quote: translate(
        'marketing.pages.about.our-team.members.technical-director.quote',
      ),
      image: '/images/technical-swamhtet.jpg',
      socials: {
        linkedin: 'www.linkedin.com/in/swam-htet-830b71129',
        email: 'drswamhtet@sakyihealthandwellness.com ',
      },
    },

    {
      name: translate(
        'marketing.pages.about.our-team.members.operations-director.name',
      ),
      role: translate(
        'marketing.pages.about.our-team.members.operations-director.role',
      ),
      bio: translate(
        'marketing.pages.about.our-team.members.operations-director.bio',
      ),
      quote: translate(
        'marketing.pages.about.our-team.members.operations-director.quote',
      ),
      image: '/images/founder-maphoo.jpg',
      socials: {
        facebook: 'https://www.facebook.com/share/1CfUg3DzMW/?mibextid=wwXIfr',
        tiktok: 'https://www.tiktok.com/@phothitnwe7?_r=1&_t=ZS-92poyHOmwwy',
        youtube: 'https://www.youtube.com/@phothitnwe4467',
      },
    },
  ];

  return (
    <SectionContainer id='our-expert-team-section' className='bg-white'>
      <div className='min-w-0 space-y-16'>
        <div
          className='mx-auto max-w-3xl min-w-0 space-y-6 text-center'
          data-aos='fade-up'
        >
          <SectionBadge
            icon={<Zap className='h-4 w-4' />}
            text={translate('marketing.pages.about.our-team.badge')}
          />

          <Heading2 lang={language} className='mx-auto text-center'>
            <span className='text-foreground'>
              {translate('marketing.pages.about.our-team.title.black')}{' '}
            </span>
            <span className='text-brand-gradient bg-clip-text text-transparent'>
              {translate('marketing.pages.about.our-team.title.gradient')}
            </span>
          </Heading2>

          <Body1 lang={language} className='mx-auto text-center'>
            {translate('marketing.pages.about.our-team.description')}
          </Body1>
        </div>

        <div className='grid gap-12 md:grid-cols-2 lg:grid-cols-3'>
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className='group'
              data-aos='fade-up'
              data-aos-delay={`${index * 100}`}
            >
              {/* Profile Image */}
              <div className='mb-6 flex justify-center'>
                <div className='relative h-32 w-32 overflow-hidden rounded-full shadow-xl ring-4 ring-white'>
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={300}
                    height={300}
                    className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                    quality={90}
                  />
                  {/* Subtle dark overlay that disappears on hover */}
                  <div className='absolute inset-0 bg-linear-to-br from-slate-900/10 to-slate-800/5 transition-opacity duration-300 group-hover:opacity-0'></div>
                </div>
              </div>

              {/* Content */}
              <div className='space-y-4'>
                <div className='text-center'>
                  <h3
                    className='text-xl font-bold text-slate-900'
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {member.name}
                  </h3>
                  <p
                    className='mt-1 text-sm font-semibold text-[#35bec5]'
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {member.role}
                  </p>
                </div>

                <div
                  className='text-left text-sm leading-relaxed text-slate-600'
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  dangerouslySetInnerHTML={{ __html: member.bio }}
                />

                <div
                  className='strong text-left text-sm leading-relaxed text-slate-600 italic'
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  dangerouslySetInnerHTML={{
                    __html: `\u201C<strong>${member.quote}</strong>\u201D`,
                  }}
                />

                {/* Social Links */}
                <div className='flex justify-center space-x-3'>
                  {member.socials.linkedin && (
                    <a
                      href={member.socials.linkedin}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all duration-300 hover:scale-110 hover:bg-[#35bec5] hover:text-white'
                    >
                      <Linkedin className='h-4 w-4' />
                    </a>
                  )}
                  {member.socials.email && (
                    <a
                      href={`mailto:${member.socials.email}`}
                      className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all duration-300 hover:scale-110 hover:bg-[#35bec5] hover:text-white'
                    >
                      <Mail className='h-4 w-4' />
                    </a>
                  )}
                  {member.socials.facebook && (
                    <a
                      href={member.socials.facebook}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all duration-300 hover:scale-110 hover:bg-[#35bec5] hover:text-white'
                    >
                      <Facebook className='h-4 w-4' />
                    </a>
                  )}
                  {member.socials.youtube && (
                    <a
                      href={member.socials.youtube}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all duration-300 hover:scale-110 hover:bg-[#35bec5] hover:text-white'
                    >
                      <Youtube className='h-4 w-4' />
                    </a>
                  )}
                  {member.socials.tiktok && (
                    <a
                      href={member.socials.tiktok}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all duration-300 hover:scale-110 hover:bg-[#35bec5] hover:text-white'
                    >
                      <Music2 className='h-4 w-4' />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
};

export default OurExpertTeamSection;
