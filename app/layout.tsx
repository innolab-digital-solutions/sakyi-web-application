import './globals.css';

import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

import QueryInitializationWrapper from '@/components/shared/QueryInitializationWrapper';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata: Metadata = {
  title: 'SaKyi Health & Wellness',
  description: 'Personalized wellness programs to support your health journey.',
};

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang='en'>
      <body className='antialiased'>
        <QueryInitializationWrapper>
          <TooltipProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </TooltipProvider>
        </QueryInitializationWrapper>
      </body>
    </html>
  );
}
