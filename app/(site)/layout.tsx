import { PropsWithChildren } from 'react';

import AOSInitializationWrapper from '@/components/site/layouts/AOSInitializationWrapper';
import Footer from '@/components/site/layouts/Footer';
import Navbar from '@/components/site/layouts/Navbar';

export default function SiteLayout({ children }: PropsWithChildren) {
  return (
    <AOSInitializationWrapper>
      <Navbar />
      {children}
      <Footer />
    </AOSInitializationWrapper>
  );
}
