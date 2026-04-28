'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SaveIcon, UserPlus2Icon } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';

import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ENDPOINTS } from '@/config/api/endpoints';
import { UserCreateSchema, UserUpdateSchema } from '@/domains/user/schemas';
import { getAdminUserById } from '@/domains/user/services';
import type { User } from '@/domains/user/types';
import { useForm } from '@/lib/form';

type CreateProps = { mode: 'create'; onSuccess?: () => void };
type EditProps = { mode: 'edit'; userId: number; onSuccess?: () => void };
type Props = CreateProps | EditProps;

function isAdminRole(user: User | undefined): boolean {
  return user?.role === 'Admin';
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
            ? 'The user account has been updated successfully.'
            : 'The user account has been created successfully.',
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
          placeholder='Enter full name'
          value={String(form.fields.name ?? '')}
          onChange={(e) => form.setData('name', e.target.value)}
          error={form.errors.name}
        />
        <TextField
          label='Email Address'
          required
          type='email'
          placeholder='Enter email address'
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
              : 'Enter password (minimum 8 characters)'
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

        <div className='border-input flex items-center justify-between rounded-md border px-4 py-3 shadow'>
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

        <div className='flex flex-nowrap items-center justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            disabled={loading}
            className='text-foreground bg-background hover:bg-muted h-10 shrink-0 cursor-pointer gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
            onClick={() => onSuccess?.()}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={loading}
            className='h-10 shrink-0 gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
          >
            {isEdit ? (
              <SaveIcon className='size-3.5' />
            ) : (
              <UserPlus2Icon className='size-3.5' />
            )}
            {loading
              ? isEdit
                ? 'Saving Changes…'
                : 'Creating…'
              : isEdit
                ? 'Save Changes'
                : 'Create Account'}
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
