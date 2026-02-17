import type { Metadata } from 'next';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata: Metadata = {
  title: 'SaKyi Health & Wellness',
  description: 'Personalized wellness programs to support your health journey.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <TooltipProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
