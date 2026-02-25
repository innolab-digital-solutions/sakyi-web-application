import { PropsWithChildren } from 'react';

import AOSAnimationProvider from '@/components/shared/providers/AOSAnimationProvider';
import Footer from '@/components/site/layouts/Footer';
import Navbar from '@/components/site/layouts/Navbar';

export default function SiteLayout({ children }: PropsWithChildren) {
  return (
    <AOSAnimationProvider>
      <Navbar />
      {children}
      <Footer />
    </AOSAnimationProvider>
  );
}
