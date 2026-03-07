import './globals.css';

import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

import TanstackQueryProvider from '@/components/TanstackQueryProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { inter, notoSansMyanmar } from '@/config/fonts';
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata: Metadata = {
  title: 'SaKyi Health & Wellness',
  description: 'Personalized wellness programs to support your health journey.',
};

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang='en' className={`${inter.variable} ${notoSansMyanmar.variable}`}>
      <body className='font-sans antialiased'>
        <TanstackQueryProvider>
          <TooltipProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </TooltipProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  );
}
