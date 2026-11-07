import './globals.css';

import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

import CustomToastProvider from '@/components/providers/CustomToastProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { interFont, notoSansMyanmarFont } from '@/config/fonts';
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from '@/config/site';
import { LanguageProvider } from '@/context/LanguageContext';
import TanstackQueryProvider from '@/lib/providers/TanstackQueryProvider';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
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
        <CustomToastProvider />
      </body>
    </html>
  );
}
