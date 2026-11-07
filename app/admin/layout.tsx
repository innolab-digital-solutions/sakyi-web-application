import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

import { NOINDEX_ROBOTS } from '@/lib/seo/metadata';

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
};

export default function AdminLayout({ children }: PropsWithChildren) {
  return children;
}
