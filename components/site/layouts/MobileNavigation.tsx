import Link from 'next/link';

import GetTheAppButton from '@/components/site/shared/GetTheAppButton';
import { HEADER_NAVIGATION } from '@/config/navigation/site';

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
  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className='border-border border-t bg-white'>
        <div className='space-y-3 px-4 py-4'>
          {HEADER_NAVIGATION.map((item, index) => {
            // Determine if the current navigation item is active based on the pathname
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={onClose}
                className={`block py-2 text-sm font-medium transition-all duration-300 ease-in-out ${
                  isActive
                    ? 'bg-brand-gradient rounded-lg px-3 text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg px-3'
                }`}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  animationDelay: `${index * 50}ms`,
                  animation: isOpen
                    ? 'slideInDown 0.3s ease-out forwards'
                    : 'none',
                }}
              >
                {/* Navigation item text */}
                {item.name}
              </Link>
            );
          })}

          <div className='border-border border-t pt-3'>
            {/* CTA Button: Get the App */}
            <GetTheAppButton onClick={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;
