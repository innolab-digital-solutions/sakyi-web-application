'use client';

import Image from 'next/image';

import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils/styles';

type LanguageToggleProps = {
  className?: string;
};

const LanguageToggle = ({ className }: LanguageToggleProps) => {
  const { language, setLanguage } = useLanguage();

  const baseSegmentClass =
    'inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors';

  return (
    <div
      className={cn(
        'border-border inline-flex items-center gap-1 rounded-full border bg-white/80 p-0.5 shadow-sm backdrop-blur-sm',
        className,
      )}
    >
      <button
        type='button'
        onClick={() => setLanguage('en')}
        className={cn(
          baseSegmentClass,
          language === 'en'
            ? 'bg-brand-gradient text-white shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
        aria-pressed={language === 'en'}
      >
        <Image
          src='/svg/english.svg'
          alt='English'
          width={14}
          height={14}
          className='h-3.5 w-3.5'
        />
        <span>EN</span>
      </button>
      <button
        type='button'
        onClick={() => setLanguage('my')}
        className={cn(
          baseSegmentClass,
          language === 'my'
            ? 'bg-brand-gradient text-white shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
        aria-pressed={language === 'my'}
      >
        <Image
          src='/svg/myanmar.svg'
          alt='Myanmar'
          width={14}
          height={14}
          className='h-3.5 w-3.5'
        />
        <span>MY</span>
      </button>
    </div>
  );
};

export default LanguageToggle;
