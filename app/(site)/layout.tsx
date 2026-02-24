import { PropsWithChildren } from 'react';
import Navbar from '@/components/site/layouts/Navbar';
import Footer from '@/components/site/layouts/Footer';
import AOSProvider from '@/components/shared/AOSProvider';

export default function PublicLayout({ children }: PropsWithChildren) {
  return (
    <AOSProvider>
      <div className="min-h-screen flex-1">
        <Navbar />
        {children}
        <Footer />
      </div>
    </AOSProvider>
  );
}
