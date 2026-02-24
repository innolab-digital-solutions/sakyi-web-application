import { PropsWithChildren } from 'react';
import Navbar from '@/components/site/layouts/Navbar';
import Footer from '@/components/site/layouts/Footer';
import AOSAnimationProvider from '@/components/shared/providers/AOSAnimationProvider';

export default function SiteLayout({ children }: PropsWithChildren) {
  return (
    <AOSAnimationProvider>
      <Navbar />
      {children}
      <Footer />
    </AOSAnimationProvider>
  );
}
