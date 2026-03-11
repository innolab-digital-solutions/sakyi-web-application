import { PropsWithChildren } from 'react';

import AOSInitializer from '@/components/marketing/layout/AOSInitializer';
import Footer from '@/components/marketing/layout/Footer';
import Navbar from '@/components/marketing/layout/Navbar';

export default function SiteLayout({ children }: PropsWithChildren) {
  return (
    <AOSInitializer>
      <Navbar />
      {children}
      <Footer />
    </AOSInitializer>
  );
}
