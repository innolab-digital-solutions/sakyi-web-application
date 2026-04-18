import type { Metadata } from 'next';

import PageHeader from '@/components/admin/layout/PageHeader';
import TeamEditClient from '@/components/admin/modules/teams/TeamEditClient';

export const metadata: Metadata = {
  title: 'Edit Team | SaKyi Admin',
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TeamEditPage({ params }: Props) {
  const { id: idParam } = await params;
  const id = Number.parseInt(idParam, 10);

  if (Number.isNaN(id)) {
    throw new Error('Invalid team id.');
  }

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Edit Team'
        description='Update team details and manage member assignments.'
      />

      <TeamEditClient id={id} />
    </div>
  );
}
