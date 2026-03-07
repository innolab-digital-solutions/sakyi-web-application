import type { ReactNode } from 'react';

type FloatingCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
  iconClassName?: string;
};

const FloatingCard = ({
  icon,
  title,
  description,
  className = '',
  iconClassName = 'bg-linear-to-r from-[#35bec5] to-[#4bc4db]',
}: FloatingCardProps) => {
  const baseClasses =
    'absolute animate-pulse rounded-2xl border border-slate-200/50 bg-white/90 p-4 shadow-xl backdrop-blur-sm hover:animate-bounce';
  const mergedClasses = [baseClasses, className].filter(Boolean).join(' ');

  return (
    <div
      className={mergedClasses}
      style={{ animation: `float 4s ease-in-out infinite` }}
    >
      <div className='flex items-center space-x-3'>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${iconClassName}`}
        >
          {icon}
        </div>
        <div>
          <div className='text-foreground font-sans text-sm font-semibold'>
            {title}
          </div>
          <div className='text-muted-foreground font-sans text-sm leading-relaxed'>
            {description}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingCard;
