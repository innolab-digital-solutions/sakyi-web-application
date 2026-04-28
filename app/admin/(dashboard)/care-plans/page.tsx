import type { Metadata } from 'next';

import CarePlansPageClient from './CarePlansPageClient';

export const metadata: Metadata = {
  title: 'Care Plans | SaKyi Admin',
  description:
    'Browse and manage all client care plans from one workspace, with quick access to assigned clients, reference codes, care windows, and current status for better follow-up.',
};

export default function CarePlansPage() {
  return <CarePlansPageClient />;
}
