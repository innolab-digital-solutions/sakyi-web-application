'use client';

import { Check, ChevronDown } from 'lucide-react';
import Image from 'next/image';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/context/LanguageContext';
import type { SupportedLanguage } from '@/lib/localization';
import { cn } from '@/lib/utils/styles';

type LanguageDropdownProps = {
  className?: string;
};

const LANGUAGES: { value: SupportedLanguage; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '/svg/english.svg' },
  { value: 'my', label: 'Myanmar', flag: '/svg/myanmar.svg' },
];

const LanguageDropdown = ({ className }: LanguageDropdownProps) => {
  const { language, setLanguage } = useLanguage();

  const current = LANGUAGES.find((l) => l.value === language) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'group border-border inline-flex items-center gap-2 rounded-full border bg-transparent py-2 pr-4 pl-3 font-sans text-sm font-medium transition-all duration-200 outline-none',
          'text-muted-foreground hover:border-muted-foreground/30 hover:bg-muted/40 hover:text-foreground',
          'data-[state=open]:text-foreground data-[state=open]:border-[#35bec5]/50 data-[state=open]:bg-[#35bec5]/5',
          'w-full focus-visible:ring-2 focus-visible:ring-[#35bec5]/40 focus-visible:ring-offset-2',
          className,
        )}
        aria-label='Select language'
      >
        <Image
          src={current.flag}
          alt=''
          width={16}
          height={16}
          className='h-4 w-4 rounded-sm object-cover'
        />
        <span className='min-w-7 text-left'>{current.value.toUpperCase()}</span>
        <ChevronDown className='h-4 w-4 shrink-0 opacity-60 transition-transform duration-200 group-data-[state=open]:rotate-180' />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='border-border/80 min-w-44 rounded-xl bg-white p-1.5 shadow-lg'
        sideOffset={6}
      >
        {LANGUAGES.map(({ value, label, flag }) => {
          const isSelected = language === value;
          return (
            <DropdownMenuItem
              key={value}
              onClick={() => setLanguage(value)}
              className={cn(
                'gap-3 rounded-lg py-2.5 pr-3 pl-8 text-sm',
                isSelected && 'bg-brand-gradient/8 text-foreground font-medium',
              )}
            >
              <span className='absolute left-2 flex size-4 items-center justify-center'>
                {isSelected ? (
                  <Check
                    className='size-4 shrink-0 text-[#35bec5]'
                    strokeWidth={2.5}
                  />
                ) : (
                  <span className='size-4' aria-hidden />
                )}
              </span>
              <Image
                src={flag}
                alt=''
                width={18}
                height={18}
                className='h-4.5 w-4.5 rounded-sm object-cover'
              />
              {label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageDropdown;
