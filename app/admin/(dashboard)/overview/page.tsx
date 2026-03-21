'use client';

import * as React from 'react';

import ComboBoxField, {
  type ComboBoxOption,
} from '@/components/shared/form/ComboBoxField';
import TextField from '@/components/shared/form/TextField';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

/** Many plain options so the list scrolls inside a fixed max height. */
const ROLE_OPTIONS_SCROLL_DEMO: ComboBoxOption[] = [
  { value: 'admin', label: 'Administrator' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
  ...Array.from({ length: 26 }, (_, i) => ({
    value: `role-ext-${i + 1}`,
    label: `Extended role ${i + 1} — ${['Operations', 'Clinical', 'Wellness', 'Admin', 'Support'][i % 5]}`,
  })),
  { value: 'disabled-demo', label: 'Unavailable (disabled)', disabled: true },
];

/** Same display name, different people — disambiguated in the list via email / org (`content`). */
const TEAM_MEMBER_OPTIONS: ComboBoxOption[] = [
  {
    value: 'usr_acme_john',
    label: 'John Smith',
    keywords: ['john.smith@acme.com', 'Acme'],
    content: (
      <div className='flex items-center gap-2.5'>
        <Avatar>
          <AvatarFallback className='text-xs'>JS</AvatarFallback>
        </Avatar>
        <div className='flex min-w-0 flex-col gap-0.5'>
          <span className='leading-none font-medium'>John Smith</span>
          <span className='text-muted-foreground text-xs leading-none'>
            john.smith@acme.com · Acme
          </span>
        </div>
      </div>
    ),
    chipContent: (
      <span className='flex min-w-0 items-center gap-1.5'>
        <Avatar size='sm'>
          <AvatarFallback className='text-[10px]'>JS</AvatarFallback>
        </Avatar>
        <span className='truncate'>John Smith</span>
      </span>
    ),
  },
  {
    value: 'usr_other_john',
    label: 'John Smith',
    keywords: ['john.smith@other.co', 'Other Co'],
    content: (
      <div className='flex items-center gap-2.5'>
        <Avatar>
          <AvatarFallback className='text-xs'>JS</AvatarFallback>
        </Avatar>
        <div className='flex min-w-0 flex-col gap-0.5'>
          <span className='leading-none font-medium'>John Smith</span>
          <span className='text-muted-foreground text-xs leading-none'>
            john.smith@other.co · Other Co
          </span>
        </div>
      </div>
    ),
    chipContent: (
      <span className='flex min-w-0 items-center gap-1.5'>
        <Avatar size='sm'>
          <AvatarFallback className='text-[10px]'>JS</AvatarFallback>
        </Avatar>
        <span className='truncate'>John Smith (Other)</span>
      </span>
    ),
  },
  {
    value: 'usr_aya',
    label: 'Aya Chen',
    keywords: ['aya@acme.com'],
    content: (
      <div className='flex items-center gap-2.5'>
        <Avatar>
          <AvatarFallback className='text-xs'>AC</AvatarFallback>
        </Avatar>
        <div className='flex min-w-0 flex-col gap-0.5'>
          <span className='leading-none font-medium'>Aya Chen</span>
          <span className='text-muted-foreground text-xs leading-none'>
            aya@acme.com
          </span>
        </div>
      </div>
    ),
    chipContent: (
      <span className='flex min-w-0 items-center gap-1.5'>
        <Avatar size='sm'>
          <AvatarFallback className='text-[10px]'>AC</AvatarFallback>
        </Avatar>
        <span className='truncate'>Aya Chen</span>
      </span>
    ),
  },
];

/** Extra plain rows so the team combobox scrolls (rich rows + simple duplicates). */
const TEAM_MEMBER_SCROLL_EXTRA: ComboBoxOption[] = Array.from(
  { length: 18 },
  (_, i) => ({
    value: `usr_demo_${i + 1}`,
    label: `Contributor ${String(i + 1).padStart(2, '0')}`,
    keywords: [`contributor${i + 1}@demo.sakyi.test`, 'demo'],
  }),
);

const TEAM_MEMBER_OPTIONS_FULL: ComboBoxOption[] = [
  ...TEAM_MEMBER_OPTIONS,
  ...TEAM_MEMBER_SCROLL_EXTRA,
];

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
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [roles, setRoles] = React.useState<string[]>([]);
  const [teamMembers, setTeamMembers] = React.useState<string[]>([]);
  const [showValidationPreview, setShowValidationPreview] =
    React.useState(false);

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

      <Card className='max-w-2xl'>
        <CardHeader className='gap-1'>
          <CardTitle className='text-base'>Form components</CardTitle>
          <CardDescription>
            Shared <code className='text-foreground'>TextField</code> and{' '}
            <code className='text-foreground'>ComboBoxField</code> — plain options,
            rich rows (<code className='text-foreground'>content</code> /
            <code className='text-foreground'>keywords</code>), multi-select
            chips (local state only).
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setShowValidationPreview((v) => !v)}
            >
              {showValidationPreview ? 'Hide' : 'Show'} validation preview
            </Button>
            <span className='text-muted-foreground text-xs'>
              Toggles sample error messages and invalid borders.
            </span>
          </div>

          <div className='grid gap-6 sm:grid-cols-2'>
            <TextField
              label='Full name'
              required
              autoComplete='name'
              placeholder='Jane Doe'
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={
                showValidationPreview
                  ? 'Please enter your full name.'
                  : undefined
              }
            />
            <TextField
              label='Email'
              type='email'
              required
              autoComplete='email'
              placeholder='you@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={
                showValidationPreview
                  ? 'Enter a valid email address.'
                  : undefined
              }
            />
          </div>

          <ComboBoxField
            multiple
            label='Roles'
            required
            placeholder='Select roles…'
            searchPlaceholder='Search roles…'
            options={ROLE_OPTIONS_SCROLL_DEMO}
            value={roles}
            onChange={setRoles}
            error={
              showValidationPreview
                ? 'Please select at least one role.'
                : undefined
            }
          />

          <ComboBoxField
            multiple
            label='Team members'
            placeholder='Add people…'
            searchPlaceholder='Search by name or email…'
            emptyMessage='No people match your search.'
            options={TEAM_MEMBER_OPTIONS_FULL}
            value={teamMembers}
            onChange={setTeamMembers}
          />
        </CardContent>
      </Card>
    </div>
  );
}
