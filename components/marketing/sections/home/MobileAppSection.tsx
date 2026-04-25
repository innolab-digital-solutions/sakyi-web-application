'use client';

import { Clock, Smartphone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading2 from '@/components/shared/typography/Heading2';
import { ROUTES } from '@/config/routes';
import { useLanguage } from '@/context/LanguageContext';

const MobileAppSection = () => {
  const { language, translate } = useLanguage();

  const isMyanmar = language === 'my';
  const mockup1Src = isMyanmar ? '/images/mockup5.png' : '/images/mockup4.png';
  const mockup2Src = isMyanmar ? '/images/mockup2.png' : '/images/mockup3.png';

  return (
    <SectionContainer id='mobile-app-section' className='bg-background'>
      <div className='grid min-w-0 items-center gap-12 lg:grid-cols-2 lg:gap-16'>
        {/* Left Column - Text Content */}
        <div className='min-w-0 space-y-8' data-aos='fade-right'>
          <div className='space-y-6'>
            <SectionBadge
              icon={<Smartphone className='h-4 w-4' />}
              text={translate('marketing.pages.home.mobile-app.badge')}
            />

            <div>
              <Heading2 lang={language}>
                <span className='text-foreground'>
                  {translate(
                    'marketing.pages.home.mobile-app.title.black',
                  )}{' '}
                </span>
                <span className='text-brand-gradient bg-clip-text text-transparent'>
                  {translate('marketing.pages.home.mobile-app.title.gradient')}
                </span>
              </Heading2>
            </div>

            <div>
              <Body1 lang={language} className='max-w-2xl'>
                {translate('marketing.pages.home.mobile-app.description')}
              </Body1>
            </div>
          </div>

          {/* App Store Buttons */}
          <div className='flex flex-col gap-4 sm:flex-row sm:gap-6'>
            <Link
              href={ROUTES.MARKETING.CONTACT}
              className='group bg-brand-gradient inline-flex items-center justify-center rounded-full px-6 py-3 font-sans text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl'
            >
              <span className='relative z-10'>
                {translate('marketing.pages.home.mobile-app.cta.primary')}
              </span>
              <Clock className='ml-2 h-5 w-5 transition-transform duration-300' />
            </Link>
          </div>

          <p className='text-muted-foreground font-sans text-sm'>
            {translate('marketing.pages.home.mobile-app.availability')}
          </p>
        </div>

        {/* Right Column - App Mockups: scale so both phones fit without clipping */}
        <div
          className='relative flex min-w-0 justify-center overflow-visible'
          data-aos='fade-left'
        >
          <div className='flex origin-center scale-75 items-center justify-center space-x-2 sm:scale-90 sm:space-x-4 lg:scale-100 lg:space-x-6'>
            {/* First Phone Mockup */}
            <div className='group relative z-10 shrink-0'>
              {/* Glow effect */}
              <div className='absolute inset-0 -z-10 rotate-12 transform rounded-[2.5rem] bg-linear-to-br from-[#35bec5]/30 to-[#0c96c4]/30 blur-2xl'></div>
              {/* Phone body */}
              <div className='relative h-88 w-44 rotate-12 transform rounded-[2.5rem] bg-gray-800 p-1.5 shadow-2xl sm:h-104 sm:w-52 lg:h-120 lg:w-56'>
                {/* Volume buttons */}
                <div className='absolute top-16 -left-0.5 h-6 w-0.5 rounded-l-full bg-gray-600'></div>
                <div className='absolute top-24 -left-0.5 h-9 w-0.5 rounded-l-full bg-gray-600'></div>
                <div className='absolute top-36 -left-0.5 h-9 w-0.5 rounded-l-full bg-gray-600'></div>
                {/* Power button */}
                <div className='absolute top-24 -right-0.5 h-12 w-0.5 rounded-r-full bg-gray-600'></div>
                {/* Screen */}
                <div className='relative h-full w-full overflow-hidden rounded-[2rem]'>
                  <div className='absolute top-2 left-1/2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-black'></div>
                  <Image
                    src={mockup1Src}
                    alt='SaKyi App - Dashboard Screen'
                    fill
                    className='object-cover'
                  />
                  <div className='absolute bottom-1.5 left-1/2 z-10 h-1 w-16 -translate-x-1/2 rounded-full bg-white/40'></div>
                </div>
              </div>
            </div>

            {/* Second Phone Mockup */}
            <div className='group relative z-0 shrink-0 -translate-y-8 sm:-translate-y-10 lg:-translate-y-12'>
              {/* Glow effect */}
              <div className='absolute inset-0 -z-10 -rotate-12 transform rounded-[2.5rem] bg-linear-to-br from-[#4bc4db]/30 to-[#35bec5]/30 blur-2xl'></div>
              {/* Phone body */}
              <div className='relative h-88 w-44 -rotate-12 transform rounded-[2.5rem] bg-gray-800 p-1.5 shadow-2xl sm:h-104 sm:w-52 lg:h-120 lg:w-56'>
                {/* Volume buttons */}
                <div className='absolute top-16 -left-0.5 h-6 w-0.5 rounded-l-full bg-gray-600'></div>
                <div className='absolute top-24 -left-0.5 h-9 w-0.5 rounded-l-full bg-gray-600'></div>
                <div className='absolute top-36 -left-0.5 h-9 w-0.5 rounded-l-full bg-gray-600'></div>
                {/* Power button */}
                <div className='absolute top-24 -right-0.5 h-12 w-0.5 rounded-r-full bg-gray-600'></div>
                {/* Screen */}
                <div className='relative h-full w-full overflow-hidden rounded-[2rem]'>
                  <div className='absolute top-2 left-1/2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-black'></div>
                  <Image
                    src={mockup2Src}
                    alt='SaKyi App - Progress Screen'
                    fill
                    className='object-cover'
                  />
                  <div className='absolute bottom-1.5 left-1/2 z-10 h-1 w-16 -translate-x-1/2 rounded-full bg-white/40'></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};

export default MobileAppSection;
