 'use client';

import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const TranslationTabs = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentLang = searchParams.get('lang') ?? 'en';

  const setLang = (lang: 'en' | 'my') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', lang);
    // Reset to first page when changing language.
    params.set('page', '1');

    const query = params.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;

    router.replace(nextUrl, { scroll: false });
  };

  const isEnglish = currentLang === 'en';
  const isMyanmar = currentLang === 'my';

  return (
    <div className='bg-muted border-border flex h-10 flex-1 items-center overflow-x-auto rounded-md border px-1 sm:flex-none'>
      <button
        type='button'
        onClick={() => setLang('en')}
        className={`flex h-8 items-center justify-center gap-2 rounded-sm px-4 text-sm ${
          isEnglish
            ? 'bg-white font-semibold text-primary'
            : 'font-medium text-muted-foreground'
        }`}
      >
        <Image
          src='/svg/english.svg'
          alt='English Flag'
          width={14}
          height={14}
          style={{ display: 'inline-block' }}
        />
        English
      </button>

      <button
        type='button'
        onClick={() => setLang('my')}
        className={`flex h-8 items-center justify-center gap-2 rounded-sm px-4 text-sm ${
          isMyanmar
            ? 'bg-white font-semibold text-primary'
            : 'font-medium text-muted-foreground'
        }`}
      >
        <Image
          src='/svg/myanmar.svg'
          alt='Myanmar Flag'
          width={14}
          height={14}
          style={{ display: 'inline-block' }}
        />
        Myanmar
      </button>
    </div>
  );
};

export default TranslationTabs;
