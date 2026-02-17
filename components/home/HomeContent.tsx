'use client'; 

import { useLanguage } from '@/context/LanguageContext';

const languageLabels: Record<'en' | 'my', string> = {
  en: 'English',
  my: 'မြန်မာ',
};

export default function HomeContent() {
  const { language, setLanguage, translate } = useLanguage();

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-8">
      <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
          <span className="text-muted-foreground">Language</span>
          <div className="bg-muted inline-flex gap-1 rounded-full p-1">
            {(['en', 'my'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  language === code
                    ? 'bg-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {languageLabels[code]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {translate('public.home.title')}
          </h1>
          <p className="text-muted-foreground text-sm text-balance sm:text-base">
            {translate('public.home.subtitle')}
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-5 py-2 text-sm font-medium shadow-sm transition"
          >
            {translate('public.home.cta')}
          </button>
        </div>
      </section>
    </main>
  );
}
