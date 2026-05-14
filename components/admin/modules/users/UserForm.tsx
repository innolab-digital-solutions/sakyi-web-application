'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SaveIcon, UserPlus2Icon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AdminFormPageSkeleton } from '@/components/admin/layout/AdminLoadingSkeletons';
import FileUploadField, {
  type FileUploadFieldRemoteFile,
} from '@/components/shared/form/FileUploadField';
import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { base } from '@/config/api/base';
import { ENDPOINTS } from '@/config/api/endpoints';
import { isSuperAdminUser } from '@/domains/user/roles';
import { UserCreateSchema, UserUpdateSchema } from '@/domains/user/schemas';
import { getAdminUserById } from '@/domains/user/services';
import type { User } from '@/domains/user/types';
import { client } from '@/lib/api/client';
import { useForm } from '@/lib/form';
import type { ApiError, FormErrors, FormFields } from '@/lib/form/types';
import { validateFormFields } from '@/lib/form/validator';

type CreateProps = { mode: 'create'; onSuccess?: () => void };
type EditProps = { mode: 'edit'; userId: number; onSuccess?: () => void };
type Props = CreateProps | EditProps;

function isAdminRole(user: User | undefined): boolean {
  return user?.role === 'Admin';
}

function resolveUserPictureDisplayUrl(
  raw: string | null | undefined,
): string | null {
  const t = raw?.trim();
  if (!t) return null;
  return t.startsWith('http') ? t : `${base.domainEndpoint}${t}`;
}

function mimeFromPictureFilename(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
  };
  return map[ext] ?? 'image/jpeg';
}

function remotePictureFilesFromUser(user?: User): FileUploadFieldRemoteFile[] {
  if (!user?.picture_url?.trim()) return [];
  const fullUrl = resolveUserPictureDisplayUrl(user.picture_url);
  if (!fullUrl) return [];
  const fileName =
    user.picture_url.split('/').pop()?.split('?')[0] ?? 'picture';
  return [
    {
      url: fullUrl,
      name: fileName,
      mimeType: mimeFromPictureFilename(fileName),
    },
  ];
}

function UserFormPictureField({
  user,
  loading,
  pictureError,
  onPictureChange,
}: {
  user?: User;
  loading: boolean;
  pictureError?: string;
  onPictureChange: (file: File | undefined) => void;
}) {
  const [existingPicture, setExistingPicture] = useState<
    FileUploadFieldRemoteFile[]
  >(() => remotePictureFilesFromUser(user));

  return (
    <FileUploadField
      label='Profile picture'
      name='picture'
      accept='.jpg,.jpeg,.png,.webp'
      maxFileSize={5 * 1024 * 1024}
      existingFiles={existingPicture}
      onExistingFilesChange={(next) => {
        setExistingPicture(next);
        if (next.length === 0) onPictureChange(undefined);
      }}
      onFilesChange={(files) => {
        const file = files[0];
        onPictureChange(file);
      }}
      emptyHint='Browse'
      disabled={loading}
      error={pictureError}
    />
  );
}

function UserFormFields({
  mode,
  user,
  onSuccess: onComplete,
}: {
  mode: 'create' | 'edit';
  user?: User;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = mode === 'edit';
  const hideAdminAccessToggle = Boolean(
    isEdit && user && isSuperAdminUser(user),
  );
  const [superAdminPatching, setSuperAdminPatching] = useState(false);

  const initialFields = useMemo(() => {
    if (isEdit && user) {
      return {
        name: user.name ?? '',
        email: user.email ?? '',
        is_admin: isAdminRole(user),
        password: '',
        password_confirmation: '',
        picture: undefined,
      };
    }
    return {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      is_admin: false,
      picture: undefined,
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
      picture: undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, user]);

  const submit = async () => {
    const endpoint =
      isEdit && user
        ? ENDPOINTS.ADMIN.MODULES.USERS.UPDATE(String(user.id))
        : ENDPOINTS.ADMIN.MODULES.USERS.CREATE;

    const handleSuccess = () => {
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
      onComplete?.();
    };

    const onFailure = (error: ApiError) => {
      toast.error(
        error.message ??
          (isEdit ? 'Failed to update user.' : 'Failed to create user.'),
      );
    };

    if (hideAdminAccessToggle && isEdit && user) {
      form.clearErrors();
      const { success, errors: clientValidationErrors } = validateFormFields(
        UserUpdateSchema,
        form.fields as FormFields,
      );
      if (!success) {
        form.setError(clientValidationErrors);
        return;
      }
      setSuperAdminPatching(true);
      try {
        const body = { ...form.fields } as Record<string, unknown>;
        delete body.is_admin;
        const response = await client<unknown>(endpoint, {
          method: 'PATCH',
          body,
          throwOnError: false,
        });
        if (response.status === 'error') {
          if (response.errors && Object.keys(response.errors).length > 0) {
            form.setError(response.errors as FormErrors);
          } else {
            onFailure(response as ApiError);
          }
        } else {
          handleSuccess();
        }
      } finally {
        setSuperAdminPatching(false);
      }
      return;
    }

    const action = isEdit
      ? form.patch.bind(form, endpoint)
      : form.post.bind(form, endpoint);

    await action({
      onSuccess: handleSuccess,
      onFailure,
    });
  };

  const loading = form.isSubmitting || superAdminPatching;
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
        <UserFormPictureField
          key={`${user?.id ?? 'create'}|${user?.picture_url ?? ''}`}
          user={user}
          loading={loading}
          pictureError={errors.picture}
          onPictureChange={(file) => {
            if (file) {
              form.setData('picture' as never, file as never);
              form.clearErrors('picture');
            } else {
              form.setData('picture' as never, undefined as never);
              form.clearErrors('picture');
            }
          }}
        />
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

        <div className='grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4'>
          <div className='min-w-0'>
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
          </div>
          <div className='min-w-0'>
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
          </div>
        </div>

        {!hideAdminAccessToggle ? (
          <div className='border-input flex items-center justify-between rounded-md border px-4 py-3 shadow-xs'>
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
        ) : null}

        <div className='flex flex-nowrap items-center justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            disabled={loading}
            className='text-foreground bg-background hover:bg-muted h-10 shrink-0 cursor-pointer gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
            onClick={() => onComplete?.()}
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
    return <AdminFormPageSkeleton />;
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
