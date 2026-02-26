import { Copyright, Facebook, Instagram, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import SocialButton from '@/components/site/shared/SocialButton';
import PATHS from '@/config/paths';

const Footer = () => {
  return (
    <footer className='mx-auto max-w-7xl overflow-hidden py-24 sm:px-6 lg:px-8'>
      <div className='flex flex-col items-center text-center'>
        {/* Top section: logo, description, social links */}
        <div className='mb-8' data-aos='fade-up' data-aos-duration='1000'>
          {/* Logo and Brand Title */}
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
            <p
              className='text-brand-gradient bg-clip-text text-2xl font-bold'
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              SaKyi Health & Wellness
            </p>
          </Link>

          {/* Brand Description */}
          <p
            className='text-muted-foreground mb-6 max-w-2xl text-base leading-relaxed font-medium'
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            SaKyi Health & Wellness - Enhancing lives via individualized
            wellness programs crafted by licensed physicians and wellness
            specialists. Your path to good health commences here.
          </p>

          {/* Social Media and Contact Links */}
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

        {/* Bottom section: copyright */}
        <div
          className='border-border border-t pt-8'
          data-aos='fade-up'
          data-aos-duration='1000'
          data-aos-delay='200'
        >
          <div
            className='text-muted-foreground flex items-center space-x-2 text-sm font-medium'
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <Copyright className='h-4 w-4' />
            <span>2026 SaKyi Health & Wellness. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
