'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';

import SelectField from '@/components/shared/form/SelectField';
import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ENDPOINTS } from '@/config/api/endpoints';
import { UserCreateSchema, UserUpdateSchema } from '@/domains/user/schemas';
import { getAdminUserById } from '@/domains/user/services';
import type { User } from '@/domains/user/types';
import { useForm } from '@/lib/form';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'archived', label: 'Archived' },
];

type Status = 'pending' | 'active' | 'suspended' | 'archived';

type CreateProps = { mode: 'create'; onSuccess?: () => void };
type EditProps = { mode: 'edit'; userId: number; onSuccess?: () => void };
type Props = CreateProps | EditProps;

function isAdminRole(user: User | undefined): boolean {
  const name = user?.role?.name ?? '';
  return name === 'admin' || name === 'super_admin';
}

function UserFormFields({
  mode,
  user,
  onSuccess,
}: {
  mode: 'create' | 'edit';
  user?: User;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = mode === 'edit';

  const initialFields = useMemo(() => {
    if (isEdit && user) {
      return {
        name: user.name ?? '',
        email: user.email ?? '',
        is_admin: isAdminRole(user),
        status: (user.status ?? 'pending') as Status,
        password: '',
        password_confirmation: '',
      };
    }
    return {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      is_admin: false,
      status: 'pending' as Status,
    };
  }, [isEdit, user]);

  const form = useForm(initialFields, {
    schema: isEdit ? UserUpdateSchema : UserCreateSchema,
  });

  useEffect(() => {
    if (!isEdit || !user) return;
    form.setDataAndDefaults({
      name: user.name ?? '',
      email: user.email ?? '',
      is_admin: isAdminRole(user),
      status: (user.status ?? 'pending') as Status,
      password: '',
      password_confirmation: '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, user]);

  const submit = async () => {
    const endpoint =
      isEdit && user
        ? ENDPOINTS.ADMIN.MODULES.USERS.UPDATE(String(user.id))
        : ENDPOINTS.ADMIN.MODULES.USERS.CREATE;

    const action = isEdit
      ? form.patch.bind(form, endpoint)
      : form.post.bind(form, endpoint);

    await action({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['table', ENDPOINTS.ADMIN.MODULES.USERS.LIST],
        });
        if (isEdit && user) {
          queryClient.invalidateQueries({ queryKey: ['user', user.id] });
        }
        toast.success(
          isEdit
            ? 'User account updated successfully.'
            : 'User account created successfully.',
        );
        onSuccess?.();
      },
      onFailure: (error) => {
        toast.error(
          error.message ??
            (isEdit ? 'Failed to update user.' : 'Failed to create user.'),
        );
      },
    });
  };

  const loading = form.isSubmitting;
  const fields = form.fields as Record<string, unknown>;
  const errors = form.errors as Record<string, string | undefined>;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      noValidate
    >
      <div className='space-y-6'>
        <TextField
          label='Full Name'
          required
          placeholder='e.g. John Doe'
          value={String(form.fields.name ?? '')}
          onChange={(e) => form.setData('name', e.target.value)}
          error={form.errors.name}
        />
        <TextField
          label='Email Address'
          required
          type='email'
          placeholder='e.g. john@example.com'
          value={String(form.fields.email ?? '')}
          onChange={(e) => form.setData('email', e.target.value)}
          error={form.errors.email}
        />
        <TextField
          label='Password'
          required={!isEdit}
          type='password'
          placeholder={
            isEdit
              ? 'Leave blank to keep current password'
              : 'Minimum 8 characters'
          }
          value={String(fields.password ?? '')}
          onChange={(e) =>
            form.setData('password' as never, e.target.value as never)
          }
          error={errors.password}
        />
        <TextField
          label='Confirm Password'
          required={!isEdit}
          type='password'
          placeholder='Re-enter password'
          value={String(fields.password_confirmation ?? '')}
          onChange={(e) =>
            form.setData(
              'password_confirmation' as never,
              e.target.value as never,
            )
          }
          error={errors.password_confirmation}
        />

        <div className='flex items-center justify-between rounded-md border border-neutral-200 px-4 py-3'>
          <div className='space-y-0.5'>
            <Label className='text-foreground text-[13px] font-semibold'>
              Admin Access
            </Label>
            <p className='text-muted-foreground text-xs font-medium'>
              Grant this user admin-level permissions.
            </p>
          </div>
          <Switch
            checked={Boolean(form.fields.is_admin)}
            onCheckedChange={(val) => form.setData('is_admin', val)}
            className='cursor-pointer'
          />
        </div>

        <SelectField
          label='Status'
          required
          placeholder='Select status…'
          options={STATUS_OPTIONS}
          value={String(form.fields.status ?? 'pending')}
          onChange={(val) =>
            form.setData('status', (val ?? 'pending') as Status)
          }
          error={form.errors.status}
        />

        <div className='flex flex-nowrap items-center justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            disabled={loading}
            className='text-foreground bg-background hover:bg-muted h-10 shrink-0 cursor-pointer gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold'
            onClick={() => onSuccess?.()}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={loading}
            className='h-10 shrink-0 gap-1.5 rounded-md px-2.5 text-[13px]! font-semibold'
          >
            {loading
              ? isEdit
                ? 'Saving Changes…'
                : 'Creating…'
              : isEdit
                ? 'Save Changes'
                : 'Create User'}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default function UserForm(props: Props) {
  if (props.mode === 'create') {
    return <UserFormFields mode='create' onSuccess={props.onSuccess} />;
  }
  return <UserFormEdit userId={props.userId} onSuccess={props.onSuccess} />;
}

function UserFormEdit({
  userId,
  onSuccess,
}: {
  userId: number;
  onSuccess?: () => void;
}) {
  const { data, isPending, isError } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getAdminUserById(userId),
  });

  if (isPending) {
    return (
      <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
        Loading user…
      </div>
    );
  }

  if (isError || !data || data.status === 'error') {
    return (
      <p className='text-destructive text-sm'>
        {data?.status === 'error' ? data.message : 'Could not load user.'}
      </p>
    );
  }

  return <UserFormFields mode='edit' user={data.data} onSuccess={onSuccess} />;
}
