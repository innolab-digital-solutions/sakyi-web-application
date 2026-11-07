import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';

import AOSInitializer from '@/components/marketing/layout/AOSInitializer';
import Footer from '@/components/marketing/layout/Footer';
import Navbar from '@/components/marketing/layout/Navbar';
import ScrollToTopButton from '@/components/marketing/ScrollToTopButton';
import JsonLd from '@/components/shared/JsonLd';
import PageTransition from '@/components/shared/navigation/PageTransition';
import TawkToWidget from '@/components/shared/TawkToWidget';
import { SITE_NAME, SITE_TITLE_TEMPLATE } from '@/config/site';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/structured-data';

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: SITE_TITLE_TEMPLATE },
};

export default function SiteLayout({ children }: PropsWithChildren) {
  return (
    <AOSInitializer>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <Navbar />
      <main id='main-content' className='marketing-copy'>
        <PageTransition effect='fade' durationMs={480}>
          {children}
        </PageTransition>
      </main>
      <Footer />
      <ScrollToTopButton />
      <TawkToWidget />
    </AOSInitializer>
  );
}
