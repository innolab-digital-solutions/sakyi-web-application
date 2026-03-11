'use client';

import { useAuth } from '@/context/AuthContext';

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const formatDate = (): string => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className='space-y-8'>
      <div className='flex flex-col space-y-1'>
        <p className='text-muted-foreground text-xs font-semibold'>
          {formatDate()}
        </p>
        <h1 className='text-foreground text-md font-bold'>
          {getGreeting()}! {user?.name ?? 'User'}
        </h1>
      </div>
    </div>
  );
}
