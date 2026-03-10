'use client';

import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import GetTheAppButton from '@/components/marketing/GetTheAppButton';
import LanguageDropdown from '@/components/marketing/LanguageDropdown';
import DesktopNavigation from '@/components/marketing/layout/DesktopNavigation';
import MobileNavigation from '@/components/marketing/layout/MobileNavigation';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

const Navbar = () => {
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const mountedId = setTimeout(() => setIsMounted(true), 0);

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(mountedId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav
      // Main navigation container, fixed at the top with fade-in animation and backdrop blur
      className={`fixed top-0 z-50 w-full bg-white transition-all duration-300 ${
        isMounted && isScrolled
          ? 'border-border border-b shadow-sm backdrop-blur-md'
          : 'backdrop-blur-sm'
      }`}
      id='navbar'
    >
      <div className='mx-auto max-w-7xl min-w-0'>
        <div className='flex h-16 min-w-0 items-center justify-between px-4 sm:px-6 lg:px-8'>
          {/* Logo and site title */}
          <Link href={ROUTES.MARKETING.HOME} className='flex items-center space-x-3'>
            <Image
              src='/images/logo.png'
              alt='SaKyi Logo'
              width={96}
              height={96}
              priority
              className='h-7 w-7 object-contain'
            />
            <span className='text-foreground font-sans text-xl font-semibold'>
              SaKyi
            </span>
          </Link>

          {/* Desktop navigation links (visible on md and up) */}
          <DesktopNavigation pathname={pathname} />

          {/* Language toggle & app button (desktop only) */}
          <div className='hidden items-center gap-4 md:flex'>
            <LanguageDropdown />
            <GetTheAppButton />
          </div>

          {/* Mobile menu toggle button (hamburger or close icon) */}
          <Button
            variant='ghost'
            size='sm'
            className='md:hidden'
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className='h-5 w-5' />
            ) : (
              <Menu className='h-5 w-5' />
            )}
          </Button>
        </div>

        {/* Collapsible mobile navigation menu */}
        <MobileNavigation
          isOpen={isMenuOpen}
          pathname={pathname}
          onClose={() => setIsMenuOpen(false)}
        />
      </div>
    </nav>
  );
};

export default Navbar;
