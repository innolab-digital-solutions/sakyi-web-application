import type { Metadata } from 'next';

import PageHeader from '@/components/admin/layout/PageHeader';
import TeamForm from '@/components/admin/modules/teams/TeamForm';

export const metadata: Metadata = {
  title: 'Create Team | SaKyi Admin',
};

export default function TeamCreatePage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Create Team'
        description='Create a new team, link it to an enrollment, and assign staff members.'
      />

      <TeamForm mode='create' />
    </div>
  );
}
