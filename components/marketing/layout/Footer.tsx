'use client';

import { Copyright, Facebook, Music2, Youtube } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import SocialButton from '@/components/marketing/SocialButton';
import { ROUTES } from '@/config/routes';
import { useLanguage } from '@/context/LanguageContext';

const Footer = () => {
  const { translate } = useLanguage();

  return (
    <footer className='marketing-copy mx-auto max-w-7xl overflow-hidden py-24 sm:px-6 lg:px-8'>
      <div className='flex flex-col items-center text-center'>
        {/* Logo and Brand */}
        <div className='mb-8'>
          <Link
            href={ROUTES.MARKETING.HOME}
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
            {translate('marketing.layout.footer.description')}
          </p>

          {/* Social Icons */}
          <div className='flex justify-center space-x-3'>
            <SocialButton
              icon={<Facebook className='h-4 w-4' />}
              href='https://www.facebook.com/share/1UnrA6wTJu/'
              label='SaKyi Health & Wellness on Facebook'
            />
            <SocialButton
              icon={<Youtube className='h-4 w-4' />}
              href='https://youtube.com/@sakyihealthandwellness3?si=j_O_nxiD-YUy9Wfo'
              label='SaKyi Health & Wellness on YouTube'
            />
            <SocialButton
              icon={<Music2 className='h-4 w-4' />}
              href='https://www.tiktok.com/@sakyihealthandwellness?_r=1&_t=ZS-9BRYkm5Mu0L'
              label='SaKyi Health & Wellness on TikTok'
            />
          </div>
        </div>

        {/* Divider, Legal Links and Copyright */}
        <div className='border-border w-full border-t pt-8'>
          <div className='flex flex-col items-center gap-4'>
            <div className='flex flex-wrap items-center justify-center gap-x-6 gap-y-2'>
              <Link
                href={ROUTES.MARKETING.PRIVACY_POLICY}
                className='text-muted-foreground hover:text-foreground font-sans text-sm font-medium transition-colors'
              >
                Privacy Policy
              </Link>
              <Link
                href={ROUTES.MARKETING.TERMS_OF_SERVICE}
                className='text-muted-foreground hover:text-foreground font-sans text-sm font-medium transition-colors'
              >
                Terms of Service
              </Link>
              <Link
                href={ROUTES.MARKETING.DISCLAIMER}
                className='text-muted-foreground hover:text-foreground font-sans text-sm font-medium transition-colors'
              >
                Disclaimer
              </Link>
            </div>
            <div className='text-muted-foreground flex items-center space-x-2 font-sans text-sm font-medium'>
              <Copyright className='h-4 w-4' />
              <span>
                {new Date().getFullYear()} SaKyi Health &amp; Wellness. All
                rights reserved.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
