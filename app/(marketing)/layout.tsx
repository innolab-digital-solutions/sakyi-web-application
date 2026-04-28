import { PropsWithChildren } from 'react';

import AOSInitializer from '@/components/marketing/layout/AOSInitializer';
import Footer from '@/components/marketing/layout/Footer';
import Navbar from '@/components/marketing/layout/Navbar';
import PageTransition from '@/components/shared/navigation/PageTransition';
import TawkToWidget from '@/components/shared/TawkToWidget';

export default function SiteLayout({ children }: PropsWithChildren) {
  return (
    <AOSInitializer>
      <Navbar />
      <PageTransition effect='fade' durationMs={480}>
        {children}
      </PageTransition>
      <Footer />
      <TawkToWidget />
    </AOSInitializer>
  );
}
