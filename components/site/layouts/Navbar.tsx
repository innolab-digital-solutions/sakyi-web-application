'use client';

import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import DesktopNavigation from '@/components/site/layouts/DesktopNavigation';
import MobileNavigation from '@/components/site/layouts/MobileNavigation';
import GetTheAppButton from '@/components/site/shared/GetTheAppButton';
import { PATHS } from '@/config/paths';

const Navbar = () => {
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Use a timeout to defer state update, making sure 'isMounted' is set only after client-side mount.
    const mountedId = setTimeout(() => setIsMounted(true), 0);

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);

    // Clean up listeners and timeouts on component unmount to prevent memory leaks and side effects.
    return () => {
      clearTimeout(mountedId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav
      // Navbar fixed at the top, responsive with dynamic background and border based on scroll state
      className={`animate-fade-in fixed top-0 z-50 w-full bg-white transition-all duration-300 ${
        isMounted && isScrolled
          ? 'border-border border-b shadow-sm backdrop-blur-md'
          : 'backdrop-blur-sm'
      }`}
      id="navbar"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo linking to home page, displayed on all devices */}
          <Link
            href={PATHS.PUBLIC.HOME}
            className="flex items-center space-x-3"
          >
            <Image
              src="/images/logo.png"
              alt="SaKyi Logo"
              width={96}
              height={96}
              priority
              className="h-7 w-7 object-contain"
            />
            <span
              className="text-foreground text-xl font-semibold"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              SaKyi
            </span>
          </Link>

          {/* Desktop navigation visible only on md+ screens */}
          <DesktopNavigation pathname={pathname} />

          {/* CTA button: Get the App, visible only on md+ screens */}
          <div className="hidden items-center md:flex">
            <GetTheAppButton />
          </div>

          {/* Mobile Menu Toggle Button: hamburger or close icon depending on state, only on mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile navigation drawer: slides down when menu is open, only on mobile */}
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
