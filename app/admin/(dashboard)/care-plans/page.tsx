import type { Metadata } from 'next';

import CarePlansPageClient from './CarePlansPageClient';

export const metadata: Metadata = {
  title: 'Care Plans | SaKyi Admin',
  description:
    'Browse, search, and manage all client care plans. Review assigned clients, reference codes, and current plan status at a glance. Quickly check care window dates, identify plan progress or issues.',
};

export default function CarePlansPage() {
  return <CarePlansPageClient />;
}
