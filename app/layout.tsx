import './globals.css';

import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import { Toaster } from 'sonner';

import { TooltipProvider } from '@/components/ui/tooltip';
import { interFont, notoSansMyanmarFont } from '@/config/fonts';
import { LanguageProvider } from '@/context/LanguageContext';
import TanstackQueryProvider from '@/lib/providers/TanstackQueryProvider';

export const metadata: Metadata = {
  title: 'SaKyi Health & Wellness',
  description: 'Personalized wellness programs to support your health journey.',
};

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html
      lang='en'
      className={`${interFont.variable} ${notoSansMyanmarFont.variable}`}
    >
      <body className='font-sans antialiased'>
        <TanstackQueryProvider>
          <TooltipProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </TooltipProvider>
        </TanstackQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
