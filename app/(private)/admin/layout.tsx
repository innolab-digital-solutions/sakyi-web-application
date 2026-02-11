import TanstackQueryProvider from '@/components/shared/TanstackQueryProvider';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';

const inter = Inter({
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn('min-h-screen', inter.variable)}>
      <TanstackQueryProvider>{children}</TanstackQueryProvider>
    </div>
  );
}
