import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LanguageProvider } from '@/context/LanguageContext';
import TanstackQueryProvider from '@/components/shared/providers/TanstackQueryProvider';

import './globals.css';

export const metadata: Metadata = {
  title: 'SaKyi Health & Wellness',
  description: 'Personalized wellness programs to support your health journey.',
};

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <TanstackQueryProvider>
          <TooltipProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </TooltipProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  );
}
