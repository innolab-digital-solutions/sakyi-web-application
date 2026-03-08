'use client';

import { Copyright, Facebook, Instagram, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import SocialButton from '@/components/site/shared/SocialButton';
import PATHS from '@/config/paths';
import { useLanguage } from '@/context/LanguageContext';

const Footer = () => {
  const { translate } = useLanguage();

  return (
    <footer className='mx-auto max-w-7xl overflow-hidden py-24 sm:px-6 lg:px-8'>
      <div className='flex flex-col items-center text-center'>
        {/* Logo and Brand */}
        <div className='mb-8' data-aos='fade-up' data-aos-duration='1000'>
          <Link
            href={PATHS.SITE.HOME}
            className='group mb-6 flex items-center justify-center space-x-3'
          >
            <Image
              src='/images/logo.png'
              alt='SaKyi Logo'
              width={35}
              height={35}
              className='object-contain'
            />
            <p className='text-brand-gradient bg-clip-text font-sans text-2xl font-bold'>
              SaKyi Health & Wellness
            </p>
          </Link>

          {/* Tagline / Description */}
          <p className='text-muted-foreground mb-6 max-w-2xl font-sans text-base leading-relaxed font-medium'>
            {translate('layout.footer.description')}
          </p>

          {/* Social Icons */}
          <div className='flex justify-center space-x-3'>
            <SocialButton
              icon={<Facebook className='h-4 w-4' />}
              href='https://www.facebook.com/share/1AZkhgRBMS/?mibextid=wwXIfr'
            />
            <SocialButton
              icon={<Instagram className='h-4 w-4' />}
              href='https://www.instagram.com/sakyihealthandwellness/'
            />
            <SocialButton
              icon={<Mail className='h-4 w-4' />}
              href={`mailto:customerservice@sakyihealthandwellness.com`}
            />
          </div>
        </div>

        {/* Divider and Copyright */}
        <div
          className='border-border border-t pt-8'
          data-aos='fade-up'
          data-aos-duration='1000'
          data-aos-delay='200'
        >
          <div className='text-muted-foreground flex items-center space-x-2 font-sans text-sm font-medium'>
            <Copyright className='h-4 w-4' />
            <span>2026 SaKyi Health & Wellness. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
