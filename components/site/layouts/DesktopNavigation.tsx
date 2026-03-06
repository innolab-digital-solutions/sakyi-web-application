import Link from 'next/link';

import { HEADER_NAVIGATION } from '@/config/navigation/site';

const DesktopNavigation = ({ pathname }: { pathname: string }) => {
  return (
    <div className='hidden items-center space-x-8 md:flex'>
      {HEADER_NAVIGATION.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.name}
            href={item.path}
            className={`group relative text-sm font-medium transition-all duration-300 ${
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <span className='relative z-10'>{item.name}</span>
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
