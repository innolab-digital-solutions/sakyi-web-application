import AdminPageHeader from '@/components/admin/layout/PageHeader';
import ProgramForm from '@/components/admin/modules/programs/ProgramForm';

export default function ProgramCreatePage() {
  return (
    <div className='space-y-8'>
      <AdminPageHeader
        title='Create Program'
        description='Configure a new program, its goals, and translations.'
      />

      <ProgramForm mode='create' />
    </div>
  );
}
