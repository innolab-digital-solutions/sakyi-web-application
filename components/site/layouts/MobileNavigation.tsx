'use client';

import Link from 'next/link';

import GetTheAppButton from '@/components/site/shared/GetTheAppButton';
import LanguageDropdown from '@/components/site/shared/LanguageDropdown';
import { HEADER_NAVIGATION } from '@/config/navigation/site';
import { useLanguage } from '@/context/LanguageContext';

type MobileNavigationProps = {
  isOpen: boolean;
  pathname: string;
  onClose: () => void;
};

const MobileNavigation = ({
  isOpen,
  pathname,
  onClose,
}: MobileNavigationProps) => {
  const { translate } = useLanguage();
  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className='border-border border-t bg-white'>
        <div className='space-y-3 px-4 py-4'>
          {HEADER_NAVIGATION.map((item, index) => {
            // Determine if the current navigation item is active
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={onClose}
                className={`block py-2 font-sans text-sm font-medium transition-all duration-300 ease-in-out ${
                  isActive
                    ? 'bg-brand-gradient rounded-lg px-3 text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg px-3'
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: isOpen
                    ? 'slideInDown 0.3s ease-out forwards'
                    : 'none',
                }}
              >
                {translate(item.name)}
              </Link>
            );
          })}

          {/* Language Toggle and Get the App Button */}
          <div className='border-border flex items-center justify-between gap-3 border-t pt-3'>
            <LanguageDropdown />

            <GetTheAppButton onClick={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;
