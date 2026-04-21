'use client';

import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { FolderPlusIcon, SaveIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';

import ComboboxField, {
  type ComboboxOption,
} from '@/components/shared/form/ComboBoxField';
import TextAreaField from '@/components/shared/form/TextAreaField';
import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import { ENDPOINTS } from '@/config/api/endpoints';
import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints/lookup';
import { ROUTES } from '@/config/routes';
import {
  MovementCategoryCreateSchema,
  MovementCategoryUpdateSchema,
} from '@/domains/movement-categories/schemas';
import {
  getMovementCategoriesForParentPicker,
  movementCategoryParentPickerQueryKey,
} from '@/domains/movement-categories/services';
import type { MovementCategory } from '@/domains/movement-categories/types';
import { useForm } from '@/lib/form';

type CreateProps = {
  mode: 'create';
  category?: never;
  onSuccess?: () => void;
};

type EditProps = {
  mode: 'edit';
  category: MovementCategory;
  onSuccess?: () => void;
};

type Props = CreateProps | EditProps;

export default function MovementCategoryForm({
  mode,
  category,
  onSuccess,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = mode === 'edit';

  const { data: categoriesForPicker } = useQuery({
    queryKey: movementCategoryParentPickerQueryKey,
    queryFn: getMovementCategoriesForParentPicker,
  });

  const parentOptions = useMemo<ComboboxOption[]>(() => {
    if (!categoriesForPicker?.length) return [];
    return categoriesForPicker
      .filter((c) => c.id !== category?.id && c.parent == null)
      .map((c) => ({ value: String(c.id), label: c.name }));
  }, [categoriesForPicker, category?.id]);

  const initialFields = useMemo(() => {
    if (mode === 'edit' && category) {
      return {
        name: category.name ?? '',
        description: category.description ?? '',
        parent_id: category.parent?.id ?? null,
        is_active: category.is_active ?? true,
      };
    }
    return {
      name: '',
      description: '',
      parent_id: null as number | null,
      is_active: true,
    };
  }, [mode, category]);

  const form = useForm(initialFields, {
    schema: isEdit
      ? MovementCategoryUpdateSchema
      : MovementCategoryCreateSchema,
  });

  useEffect(() => {
    if (mode !== 'edit' || !category) return;
    form.setDataAndDefaults({
      name: category.name ?? '',
      description: category.description ?? '',
      parent_id: category.parent?.id ?? null,
      is_active: category.is_active ?? true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, category]);

  const submit = async () => {
    if (isEdit) {
      await form.patch(
        ENDPOINTS.ADMIN.MODULES.MOVEMENT_CATEGORIES.DETAIL(String(category.id)),
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: [
                'table',
                ENDPOINTS.ADMIN.MODULES.MOVEMENT_CATEGORIES.LIST,
              ],
            });
            queryClient.invalidateQueries({
              queryKey: ['lookup', LOOKUP_ENDPOINTS.MOVEMENT_CATEGORIES],
            });
            queryClient.invalidateQueries({
              queryKey: movementCategoryParentPickerQueryKey,
            });
            toast.success('Movement category has been updated successfully.');
            if (onSuccess) onSuccess();
            else router.push(ROUTES.ADMIN.MODULES.MOVEMENT_CATEGORIES.LIST);
          },
          onFailure: (error) => {
            toast.error(error.message ?? 'Failed to update movement category.');
          },
        },
      );
      return;
    }

    await form.post(ENDPOINTS.ADMIN.MODULES.MOVEMENT_CATEGORIES.CREATE, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['table', ENDPOINTS.ADMIN.MODULES.MOVEMENT_CATEGORIES.LIST],
        });
        queryClient.invalidateQueries({
          queryKey: ['lookup', LOOKUP_ENDPOINTS.MOVEMENT_CATEGORIES],
        });
        queryClient.invalidateQueries({
          queryKey: movementCategoryParentPickerQueryKey,
        });
        toast.success('Movement category has been created successfully.');
        if (onSuccess) onSuccess();
        else router.push(ROUTES.ADMIN.MODULES.MOVEMENT_CATEGORIES.LIST);
      },
      onFailure: (error) => {
        toast.error(error.message ?? 'Failed to create movement category.');
      },
    });
  };

  const loading = form.isSubmitting;

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
          label='Category Name'
          required
          placeholder='e.g. Strength Training'
          value={String(form.fields.name ?? '')}
          onChange={(e) => form.setData('name', e.target.value)}
          error={form.errors.name}
        />
        <TextAreaField
          label='Description'
          name='description'
          placeholder='Optional description for this movement category…'
          rows={3}
          value={String(form.fields.description ?? '')}
          onChange={(e) => form.setData('description', e.target.value)}
          error={form.errors.description}
        />
        <ComboboxField
          label='Parent movement category'
          placeholder='Select a top-level movement category…'
          searchPlaceholder='Search top-level movement categories…'
          emptyMessage='No top-level movement categories found.'
          options={parentOptions}
          value={form.fields.parent_id ? String(form.fields.parent_id) : null}
          onChange={(val) =>
            form.setData('parent_id', val ? Number(val) : null)
          }
          error={form.errors.parent_id}
        />

        <div className='flex flex-nowrap items-center justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            disabled={loading}
            className='text-foreground bg-background hover:bg-muted h-10 shrink-0 cursor-pointer gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
            onClick={() =>
              onSuccess
                ? onSuccess()
                : router.push(ROUTES.ADMIN.MODULES.MOVEMENT_CATEGORIES.LIST)
            }
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
              <FolderPlusIcon className='size-3.5' />
            )}
            {loading
              ? isEdit
                ? 'Saving Changes…'
                : 'Creating…'
              : isEdit
                ? 'Save Changes'
                : 'Create Movement Category'}
          </Button>
        </div>
      </div>
    </form>
  );
}
