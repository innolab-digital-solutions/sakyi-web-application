'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { getNutritionCategoriesLookup } from '@/domains/nutrition-categories/services';
import {
  NutritionItemCreateSchema,
  NutritionItemUpdateSchema,
} from '@/domains/nutrition-items/schemas';
import type { NutritionItem } from '@/domains/nutrition-items/types';
import { getUnitsLookup } from '@/domains/units/services';
import { useForm } from '@/lib/form';

type CreateProps = {
  mode: 'create';
  item?: never;
  onSuccess?: () => void;
};

type EditProps = {
  mode: 'edit';
  item: NutritionItem;
  onSuccess?: () => void;
};

type Props = CreateProps | EditProps;

export default function NutritionItemForm({ mode, item, onSuccess }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = mode === 'edit';

  const { data: categoriesData } = useQuery({
    queryKey: ['lookup', LOOKUP_ENDPOINTS.NUTRITION_CATEGORIES],
    queryFn: async () => {
      const response = await getNutritionCategoriesLookup();
      if (response.status !== 'success') return [];
      return response.data;
    },
  });

  const { data: unitsData } = useQuery({
    queryKey: ['lookup', LOOKUP_ENDPOINTS.UNITS],
    queryFn: async () => {
      const response = await getUnitsLookup();
      if (response.status !== 'success') return [];
      return response.data;
    },
  });

  const categoryOptions = useMemo<ComboboxOption[]>(() => {
    if (!categoriesData) return [];
    return categoriesData.map((c) => ({ value: String(c.id), label: c.name }));
  }, [categoriesData]);

  const unitOptions = useMemo<ComboboxOption[]>(() => {
    if (!unitsData) return [];
    return unitsData.map((u) => ({
      value: String(u.id),
      label: `${u.name} (${u.abbreviation})`,
    }));
  }, [unitsData]);

  const initialFields = useMemo(() => {
    if (mode === 'edit' && item) {
      return {
        name: item.name ?? '',
        description: item.description ?? '',
        nutrition_category_id:
          item.nutrition_category?.id ?? (null as number | null),
        default_unit_id: item.default_unit?.id ?? (null as number | null),
        is_active: item.is_active ?? true,
      };
    }
    return {
      name: '',
      description: '',
      nutrition_category_id: null as number | null,
      default_unit_id: null as number | null,
      is_active: true,
    };
  }, [mode, item]);

  const form = useForm(initialFields, {
    schema: isEdit ? NutritionItemUpdateSchema : NutritionItemCreateSchema,
  });

  useEffect(() => {
    if (mode !== 'edit' || !item) return;
    form.setDataAndDefaults({
      name: item.name ?? '',
      description: item.description ?? '',
      nutrition_category_id: item.nutrition_category?.id ?? null,
      default_unit_id: item.default_unit?.id ?? null,
      is_active: item.is_active ?? true,
    });
    // Intentionally omit `form` to avoid re-snapshotting defaults.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, item]);

  const submit = async () => {
    if (isEdit) {
      await form.patch(
        ENDPOINTS.ADMIN.MODULES.NUTRITION_ITEMS.DETAIL(String(item.id)),
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ['table', ENDPOINTS.ADMIN.MODULES.NUTRITION_ITEMS.LIST],
            });
            toast.success('Food item updated successfully.');
            if (onSuccess) onSuccess();
            else router.push(ROUTES.ADMIN.MODULES.NUTRITION_ITEMS.LIST);
          },
          onFailure: (error) => {
            toast.error(error.message ?? 'Failed to update food item.');
          },
        },
      );
      return;
    }

    await form.post(ENDPOINTS.ADMIN.MODULES.NUTRITION_ITEMS.CREATE, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['table', ENDPOINTS.ADMIN.MODULES.NUTRITION_ITEMS.LIST],
        });
        toast.success('Food item created successfully.');
        if (onSuccess) onSuccess();
        else router.push(ROUTES.ADMIN.MODULES.NUTRITION_ITEMS.LIST);
      },
      onFailure: (error) => {
        toast.error(error.message ?? 'Failed to create food item.');
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
          placeholder='e.g. Chicken Breast'
          value={String(form.fields.name ?? '')}
          onChange={(e) => form.setData('name', e.target.value)}
          error={form.errors.name}
        />
        <TextAreaField
          label='Description'
          name='description'
          placeholder='Optional description for this item…'
          rows={3}
          value={String(form.fields.description ?? '')}
          onChange={(e) => form.setData('description', e.target.value)}
          error={form.errors.description}
        />
        <ComboboxField
          label='Category'
          placeholder='Select a category…'
          searchPlaceholder='Search categories…'
          emptyMessage='No categories found.'
          required
          options={categoryOptions}
          value={
            form.fields.nutrition_category_id
              ? String(form.fields.nutrition_category_id)
              : null
          }
          onChange={(val) =>
            form.setData('nutrition_category_id', val ? Number(val) : null)
          }
          error={form.errors.nutrition_category_id}
        />
        <ComboboxField
          label='Measurement'
          placeholder='Select a measurement'
          searchPlaceholder='Search by name or abbreviation…'
          emptyMessage='No measurements found in the catalog.'
          options={unitOptions}
          value={
            form.fields.default_unit_id
              ? String(form.fields.default_unit_id)
              : null
          }
          onChange={(val) =>
            form.setData('default_unit_id', val ? Number(val) : null)
          }
          error={form.errors.default_unit_id}
        />

        <div className='flex flex-nowrap items-center justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            disabled={loading}
            className='text-foreground bg-background hover:bg-muted h-10 shrink-0 cursor-pointer gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold'
            onClick={() =>
              onSuccess
                ? onSuccess()
                : router.push(ROUTES.ADMIN.MODULES.NUTRITION_ITEMS.LIST)
            }
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
                : 'Create Food Item'}
          </Button>
        </div>
      </div>
    </form>
  );
}
