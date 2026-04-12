'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import Link from 'next/link';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ENDPOINTS } from '@/config/api/endpoints';
import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints/lookup';
import { ROUTES } from '@/config/routes';
import { getMovementCategoriesLookup } from '@/domains/movement-categories/services';
import {
  type MediaItemInput,
  MovementExerciseCreateSchema,
  MovementExerciseUpdateSchema,
} from '@/domains/movement-exercises/schemas';
import { getMovementEquipmentLookup } from '@/domains/movement-exercises/services';
import type { MovementExercise } from '@/domains/movement-exercises/types';
import { useForm } from '@/lib/form';

const STATUS_OPTIONS: SelectFieldOption[] = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

const DIFFICULTY_OPTIONS: SelectFieldOption[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const MEDIA_TYPE_OPTIONS = [
  { value: 'url', label: 'URL' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
] as const;

type CreateProps = {
  mode: 'create';
  exercise?: never;
};

type EditProps = {
  mode: 'edit';
  exercise: MovementExercise;
};

type Props = CreateProps | EditProps;

export default function ExerciseForm({ mode, exercise }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = mode === 'edit';

  const { data: categoriesData } = useQuery({
    queryKey: ['lookup', LOOKUP_ENDPOINTS.MOVEMENT_CATEGORIES],
    queryFn: async () => {
      const response = await getMovementCategoriesLookup();
      if (response.status !== 'success') return [];
      return response.data;
    },
  });

  const { data: equipmentData } = useQuery({
    queryKey: ['lookup', LOOKUP_ENDPOINTS.MOVEMENT_EQUIPMENT],
    queryFn: async () => {
      const response = await getMovementEquipmentLookup();
      if (response.status !== 'success') return [];
      return response.data;
    },
  });

  const categoryOptions = useMemo<ComboboxOption[]>(() => {
    const loaded = (categoriesData ?? []).map((c) => ({
      value: String(c.id),
      label: c.name,
    }));

    // While the lookup is loading in edit mode, seed the selected option from
    // the exercise payload so the combobox never shows a raw ID.
    if (isEdit && exercise?.movement_category) {
      const { id, name } = exercise.movement_category;
      const idStr = String(id);
      if (!loaded.some((o) => o.value === idStr)) {
        return [{ value: idStr, label: name }, ...loaded];
      }
    }

    return loaded;
  }, [categoriesData, isEdit, exercise]);

  const initialFields = useMemo(() => {
    if (isEdit && exercise) {
      return {
        movement_category_id:
          exercise.movement_category?.id ?? (null as number | null),
        name: exercise.name ?? '',
        description: exercise.description ?? '',
        difficulty: exercise.difficulty ?? 'beginner',
        is_active: exercise.is_active ?? true,
        media: exercise.media.map((m) => ({
          type: m.type,
          url: m.url,
        })) as MediaItemInput[],
        equipment_ids: exercise.equipments.map((e) => e.id) as number[],
      };
    }
    return {
      movement_category_id: null as number | null,
      name: '',
      description: '',
      difficulty: 'beginner' as const,
      is_active: true,
      media: [] as MediaItemInput[],
      equipment_ids: [] as number[],
    };
  }, [isEdit, exercise]);

  const form = useForm(initialFields, {
    schema: isEdit
      ? MovementExerciseUpdateSchema
      : MovementExerciseCreateSchema,
  });

  useEffect(() => {
    if (!isEdit || !exercise) return;
    form.setDataAndDefaults({
      movement_category_id: exercise.movement_category?.id ?? null,
      name: exercise.name ?? '',
      description: exercise.description ?? '',
      difficulty: exercise.difficulty ?? 'beginner',
      is_active: exercise.is_active ?? true,
      media: exercise.media.map((m) => ({ type: m.type, url: m.url })),
      equipment_ids: exercise.equipments.map((e) => e.id),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, exercise]);

  const mediaItems = (form.fields.media as MediaItemInput[] | null) ?? [];

  const addMedia = () => {
    form.setData('media', [...mediaItems, { type: 'url' as const, url: '' }]);
  };

  const updateMedia = (
    index: number,
    field: keyof MediaItemInput,
    value: string,
  ) => {
    const updated = mediaItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    form.setData('media', updated);
  };

  const removeMedia = (index: number) => {
    form.setData(
      'media',
      mediaItems.filter((_, i) => i !== index),
    );
  };

  const submit = async () => {
    if (isEdit) {
      await form.patch(
        ENDPOINTS.ADMIN.MODULES.MOVEMENT_EXERCISES.DETAIL(String(exercise.id)),
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: [
                'table',
                ENDPOINTS.ADMIN.MODULES.MOVEMENT_EXERCISES.LIST,
              ],
            });
            queryClient.invalidateQueries({
              queryKey: [
                ENDPOINTS.ADMIN.MODULES.MOVEMENT_EXERCISES.DETAIL(
                  String(exercise.id),
                ),
                exercise.id,
              ],
            });
            toast.success('Exercise updated successfully.');
            router.push(ROUTES.ADMIN.MODULES.MOVEMENT_EXERCISES.LIST);
          },
          onFailure: (error) => {
            toast.error(error.message ?? 'Failed to update exercise.');
          },
        },
      );
      return;
    }

    await form.post(ENDPOINTS.ADMIN.MODULES.MOVEMENT_EXERCISES.CREATE, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['table', ENDPOINTS.ADMIN.MODULES.MOVEMENT_EXERCISES.LIST],
        });
        toast.success('Exercise created successfully.');
        router.push(ROUTES.ADMIN.MODULES.MOVEMENT_EXERCISES.LIST);
      },
      onFailure: (error) => {
        toast.error(error.message ?? 'Failed to create exercise.');
      },
    });
  };

  const loading = form.isSubmitting;

  return (
    <div className='space-y-6'>
      {/* Back button */}
      <Button
        asChild
        variant='ghost'
        size='sm'
        className='-ml-2 cursor-pointer'
      >
        <Link href={ROUTES.ADMIN.MODULES.MOVEMENT_EXERCISES.LIST}>
          <ArrowLeftIcon className='size-4' />
          Back to Exercises
        </Link>
      </Button>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        noValidate
      >
        <div className='grid gap-6 lg:grid-cols-[2fr_1fr]'>
          {/* ── Left column — main content ── */}
          <div className='space-y-5'>
            {/* Basic info card */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-5'>
                <TextField
                  label='Name'
                  required
                  placeholder='e.g. Barbell Back Squat'
                  value={String(form.fields.name ?? '')}
                  onChange={(e) => form.setData('name', e.target.value)}
                  error={form.errors.name}
                />
                <ComboboxField
                  label='Category'
                  required
                  placeholder='Select a category…'
                  searchPlaceholder='Search categories…'
                  emptyMessage='No categories found.'
                  options={categoryOptions}
                  value={
                    form.fields.movement_category_id
                      ? String(form.fields.movement_category_id)
                      : null
                  }
                  onChange={(val) =>
                    form.setData(
                      'movement_category_id',
                      val ? Number(val) : null,
                    )
                  }
                  error={form.errors.movement_category_id}
                />
                <TextAreaField
                  label='Description'
                  placeholder='Optional description for this exercise…'
                  rows={4}
                  value={String(form.fields.description ?? '')}
                  onChange={(e) => form.setData('description', e.target.value)}
                  error={form.errors.description}
                />
              </CardContent>
            </Card>

            {/* Media card */}
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0'>
                <CardTitle className='text-base'>Media</CardTitle>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='cursor-pointer gap-1.5'
                  onClick={addMedia}
                >
                  <PlusIcon className='size-3.5' />
                  Add media
                </Button>
              </CardHeader>
              <CardContent>
                {mediaItems.length === 0 ? (
                  <p className='text-muted-foreground py-4 text-center text-sm'>
                    No media added. Click &quot;Add media&quot; to attach
                    videos, images, or links.
                  </p>
                ) : (
                  <div className='space-y-3'>
                    {mediaItems.map((item, index) => (
                      <div
                        key={index}
                        className='border-border flex items-start gap-3 rounded-lg border p-3'
                      >
                        <div className='min-w-[120px]'>
                          <Label className='text-muted-foreground mb-1.5 block text-xs'>
                            Type
                          </Label>
                          <Select
                            value={item.type}
                            onValueChange={(val) =>
                              updateMedia(index, 'type', val)
                            }
                          >
                            <SelectTrigger className='h-9 text-sm'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MEDIA_TYPE_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='flex-1'>
                          <Label className='text-muted-foreground mb-1.5 block text-xs'>
                            URL
                          </Label>
                          <input
                            type='url'
                            placeholder='https://…'
                            value={item.url}
                            onChange={(e) =>
                              updateMedia(index, 'url', e.target.value)
                            }
                            className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                          />
                        </div>
                        <div className='pt-6'>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='text-destructive hover:text-destructive size-9 cursor-pointer'
                            onClick={() => removeMedia(index)}
                          >
                            <Trash2Icon className='size-4' />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Right column — sidebar ── */}
          <div className='space-y-4 lg:sticky lg:top-6 lg:self-start'>
            {/* Equipment card */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Equipment</CardTitle>
              </CardHeader>
              <CardContent>
                <ComboboxField
                  multiple
                  placeholder='Select equipment…'
                  searchPlaceholder='Search equipment…'
                  emptyMessage='No equipment found.'
                  options={(equipmentData ?? []).map((e) => ({
                    value: String(e.id),
                    label: e.name,
                  }))}
                  value={(
                    (form.fields.equipment_ids as number[] | null) ?? []
                  ).map(String)}
                  onChange={(vals) =>
                    form.setData(
                      'equipment_ids',
                      (vals as string[]).map(Number),
                    )
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Settings</CardTitle>
              </CardHeader>
              <CardContent className='space-y-5'>
                <SelectField
                  label='Difficulty'
                  required
                  placeholder='Select difficulty…'
                  options={DIFFICULTY_OPTIONS}
                  value={String(form.fields.difficulty ?? 'beginner')}
                  onChange={(val) => form.setData('difficulty', val)}
                  error={form.errors.difficulty}
                />
                <SelectField
                  label='Status'
                  required
                  placeholder='Select status…'
                  options={STATUS_OPTIONS}
                  value={String(form.fields.is_active ?? true)}
                  onChange={(val) => form.setData('is_active', val === 'true')}
                  error={form.errors.is_active}
                />
              </CardContent>
            </Card>

            <div className='flex flex-col gap-2.5'>
              <Button
                type='submit'
                className='w-full cursor-pointer'
                disabled={loading}
              >
                {loading
                  ? isEdit
                    ? 'Saving…'
                    : 'Creating…'
                  : isEdit
                    ? 'Save Changes'
                    : 'Create Exercise'}
              </Button>
              <Button
                type='button'
                variant='outline'
                className='w-full cursor-pointer'
                disabled={loading}
                onClick={() =>
                  router.push(ROUTES.ADMIN.MODULES.MOVEMENT_EXERCISES.LIST)
                }
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
