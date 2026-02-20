import { PropsWithChildren } from 'react';
import Navbar from '@/components/public/layouts/Navbar';
import Footer from '@/components/public/layouts/Footer';

export default function PublicLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
