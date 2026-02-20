import { PropsWithChildren } from 'react';
import Navbar from '@/components/public/layouts/Navbar';
import Footer from '@/components/public/layouts/Footer';
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
