'use client';

import Link from 'next/link';

import { HEADER_NAVIGATION } from '@/config/navigation/marketing';
import { useLanguage } from '@/context/LanguageContext';

const DesktopNavigation = ({ pathname }: { pathname: string }) => {
  const { translate } = useLanguage();

  return (
    <div className='hidden items-center space-x-8 md:flex'>
      {HEADER_NAVIGATION.map((item) => {
        // Determine if the current navigation item is active
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.name}
            href={item.path}
            className={`group relative font-sans text-sm font-medium transition-all duration-300 ${
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className='relative z-10'>{translate(item.name)}</span>
            {/* Underline animation: expands to full width if active or on hover  */}
            <span
              className={`bg-brand-gradient absolute inset-x-0 -bottom-1 h-0.5 transition-all duration-300 ${
                isActive ? 'w-full' : 'w-0 group-hover:w-full'
              }`}
            ></span>
          </Link>
        );
      })}
    </div>
  );
};

export default DesktopNavigation;
