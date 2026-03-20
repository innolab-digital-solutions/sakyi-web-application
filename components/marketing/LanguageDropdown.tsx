'use client';

import { Check, ChevronDown } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LANGUAGES, type SupportedLanguage } from '@/config/languages';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils/styles';

const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  en: '🇬🇧',
  my: '🇲🇲',
};

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'EN',
  my: 'MY',
};

type LanguageDropdownProps = {
  className?: string;
};

const LanguageDropdown = ({ className }: LanguageDropdownProps) => {
  const { language, setLanguage } = useLanguage();

  const current =
    LANGUAGES.find((entry) => entry.code === language) ?? LANGUAGES[0];

  const handleSelect = (code: SupportedLanguage) => {
    if (code === language) return;
    setLanguage(code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium transition-all duration-200 outline-none',
          'text-slate-600 hover:border-[#35bec5]/40 hover:bg-[#35bec5]/5 hover:text-slate-900',
          'data-[state=open]:border-[#35bec5]/50 data-[state=open]:bg-[#35bec5]/5 data-[state=open]:text-slate-900',
          'focus-visible:ring-2 focus-visible:ring-[#35bec5]/40 focus-visible:ring-offset-2',
          'shadow-sm hover:shadow-md',
          className,
        )}
        aria-label='Select language'
      >
        <span className='text-base leading-none'>
          {LANGUAGE_FLAGS[current.code]}
        </span>
        <span
          className='text-xs font-semibold tracking-wide'
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {LANGUAGE_LABELS[current.code]}
        </span>
        <ChevronDown className='h-3.5 w-3.5 shrink-0 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180' />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        className='min-w-40 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl'
        sideOffset={8}
      >
        {LANGUAGES.map(({ code, name }) => {
          const isSelected = language === code;
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => handleSelect(code)}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150',
                isSelected
                  ? 'bg-gradient-to-r from-[#35bec5]/10 to-[#0c96c4]/10 font-medium text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <span className='text-base leading-none'>
                {LANGUAGE_FLAGS[code]}
              </span>
              <span
                className='flex-1'
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {name}
              </span>
              {isSelected && (
                <Check
                  className='h-3.5 w-3.5 shrink-0 text-[#35bec5]'
                  strokeWidth={2.5}
                />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageDropdown;
