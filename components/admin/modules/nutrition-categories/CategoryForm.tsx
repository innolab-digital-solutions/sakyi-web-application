'use client';

import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';

import ComboboxField, {
  type ComboboxOption,
} from '@/components/shared/form/ComboBoxField';
import SelectField, {
  type SelectFieldOption,
} from '@/components/shared/form/SelectField';
import TextAreaField from '@/components/shared/form/TextAreaField';
import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import { ENDPOINTS } from '@/config/api/endpoints';
import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints/lookup';
import { ROUTES } from '@/config/routes';
import {
  NutritionCategoryCreateSchema,
  NutritionCategoryUpdateSchema,
} from '@/domains/nutrition-categories/schemas';
import { getNutritionCategoriesLookup } from '@/domains/nutrition-categories/services';
import type { NutritionCategory } from '@/domains/nutrition-categories/types';
import { useForm } from '@/lib/form';

const STATUS_OPTIONS: SelectFieldOption[] = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

type CreateProps = {
  mode: 'create';
  category?: never;
  onSuccess?: () => void;
};

type EditProps = {
  mode: 'edit';
  category: NutritionCategory;
  onSuccess?: () => void;
};

type Props = CreateProps | EditProps;

export default function NutritionCategoryForm({
  mode,
  category,
  onSuccess,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = mode === 'edit';

  const { data: lookupData } = useQuery({
    queryKey: ['lookup', LOOKUP_ENDPOINTS.NUTRITION_CATEGORIES],
    queryFn: async () => {
      const response = await getNutritionCategoriesLookup();
      if (response.status !== 'success') return [];
      return response.data;
    },
  });

  const parentOptions = useMemo<ComboboxOption[]>(() => {
    if (!lookupData) return [];
    return lookupData
      .filter((c) => c.id !== category?.id)
      .map((c) => ({ value: String(c.id), label: c.name }));
  }, [lookupData, category?.id]);

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
      ? NutritionCategoryUpdateSchema
      : NutritionCategoryCreateSchema,
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
        ENDPOINTS.ADMIN.MODULES.NUTRITION_CATEGORIES.DETAIL(
          String(category.id),
        ),
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: [
                'table',
                ENDPOINTS.ADMIN.MODULES.NUTRITION_CATEGORIES.LIST,
              ],
            });
            queryClient.invalidateQueries({
              queryKey: ['lookup', LOOKUP_ENDPOINTS.NUTRITION_CATEGORIES],
            });
            toast.success('Category updated successfully.');
            if (onSuccess) onSuccess();
            else router.push(ROUTES.ADMIN.MODULES.NUTRITION_CATEGORIES.LIST);
          },
          onFailure: (error) => {
            toast.error(error.message ?? 'Failed to update category.');
          },
        },
      );
      return;
    }

    await form.post(ENDPOINTS.ADMIN.MODULES.NUTRITION_CATEGORIES.CREATE, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            'table',
            ENDPOINTS.ADMIN.MODULES.NUTRITION_CATEGORIES.LIST,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: ['lookup', LOOKUP_ENDPOINTS.NUTRITION_CATEGORIES],
        });
        toast.success('Category created successfully.');
        if (onSuccess) onSuccess();
        else router.push(ROUTES.ADMIN.MODULES.NUTRITION_CATEGORIES.LIST);
      },
      onFailure: (error) => {
        toast.error(error.message ?? 'Failed to create category.');
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
          label='Name'
          required
          placeholder='e.g. Macronutrients'
          value={String(form.fields.name ?? '')}
          onChange={(e) => form.setData('name', e.target.value)}
          error={form.errors.name}
        />
        <TextAreaField
          label='Description'
          name='description'
          placeholder='Optional description for this category…'
          rows={3}
          value={String(form.fields.description ?? '')}
          onChange={(e) => form.setData('description', e.target.value)}
          error={form.errors.description}
        />
        <ComboboxField
          label='Parent Category'
          placeholder='Select a parent category…'
          searchPlaceholder='Search categories…'
          emptyMessage='No categories found.'
          options={parentOptions}
          value={form.fields.parent_id ? String(form.fields.parent_id) : null}
          onChange={(val) =>
            form.setData('parent_id', val ? Number(val) : null)
          }
          error={form.errors.parent_id}
        />
        <SelectField
          label='Status'
          name='is_active'
          required
          placeholder='Select status…'
          options={STATUS_OPTIONS}
          value={String(form.fields.is_active ?? true)}
          onChange={(val) => form.setData('is_active', val === 'true')}
          error={form.errors.is_active}
        />

        <div className='flex items-center justify-end gap-3'>
          <Button
            type='button'
            variant='outline'
            disabled={loading}
            onClick={() =>
              onSuccess
                ? onSuccess()
                : router.push(ROUTES.ADMIN.MODULES.NUTRITION_CATEGORIES.LIST)
            }
          >
            Cancel
          </Button>
          <Button type='submit' disabled={loading}>
            {loading
              ? isEdit
                ? 'Saving…'
                : 'Creating…'
              : isEdit
                ? 'Save Changes'
                : 'Create Category'}
          </Button>
        </div>
      </div>
    </form>
  );
}
