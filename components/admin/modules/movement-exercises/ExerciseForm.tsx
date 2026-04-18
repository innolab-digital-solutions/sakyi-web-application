'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon } from 'lucide-react';
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

const DIFFICULTY_OPTIONS: SelectFieldOption[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

type CreateProps = {
  mode: 'create';
  exercise?: never;
  onSuccess?: () => void;
};

type EditProps = {
  mode: 'edit';
  exercise: MovementExercise;
  onSuccess?: () => void;
};

type Props = CreateProps | EditProps;

/** Single UI field maps to `media: [] | [{ type, url }]` (same API shape as before). */
function mediaFromYoutubeInput(raw: string): MediaItemInput[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  return [{ type: 'video', url: trimmed }];
}

function firstMediaItem(media: MediaItemInput[] | null | undefined): MediaItemInput | null {
  const list = media ?? [];
  return list.length > 0 ? list[0] : null;
}

export default function ExerciseForm({ mode, exercise, onSuccess }: Props) {
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
        media: exercise.media.length
          ? ([
              {
                type: exercise.media[0].type,
                url: exercise.media[0].url,
              },
            ] as MediaItemInput[])
          : [],
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
      media: exercise.media.length
        ? [{ type: exercise.media[0].type, url: exercise.media[0].url }]
        : [],
      equipment_ids: exercise.equipments.map((e) => e.id),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, exercise]);

  const mediaItems = (form.fields.media as MediaItemInput[] | null) ?? [];
  const youtubeUrl = firstMediaItem(mediaItems)?.url ?? '';

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
            if (onSuccess) onSuccess();
            else router.push(ROUTES.ADMIN.MODULES.MOVEMENT_EXERCISES.LIST);
          },
          onFailure: (error) => {
            toast.error(error.message ?? 'Failed to save exercise.');
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
        if (onSuccess) onSuccess();
        else router.push(ROUTES.ADMIN.MODULES.MOVEMENT_EXERCISES.LIST);
      },
      onFailure: (error) => {
        toast.error(error.message ?? 'Failed to add exercise.');
      },
    });
  };

  const loading = form.isSubmitting;

  return (
    <>
      {!onSuccess && (
        <div className='mb-6 flex flex-wrap items-center justify-end gap-3'>
          <Button
            asChild
            type='button'
            variant='outline'
            className='text-foreground bg-background hover:bg-muted h-10 shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            <Link href={ROUTES.ADMIN.MODULES.MOVEMENT_EXERCISES.LIST}>
              <ArrowLeftIcon className='size-3.5' />
              Back to Exercises
            </Link>
          </Button>
        </div>
      )}

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
            placeholder='e.g. Barbell Back Squat'
            value={String(form.fields.name ?? '')}
            onChange={(e) => form.setData('name', e.target.value)}
            error={form.errors.name}
          />
          <TextAreaField
            label='Description'
            name='description'
            placeholder='Optional description for this exercise…'
            rows={3}
            value={String(form.fields.description ?? '')}
            onChange={(e) => form.setData('description', e.target.value)}
            error={form.errors.description}
          />
          <div className='grid min-w-0 gap-6 sm:grid-cols-2'>
            <div className='min-w-0'>
              <ComboboxField
                className='min-w-0'
                label='Category'
                required
                placeholder='Select category…'
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
            </div>
            <div className='min-w-0'>
              <SelectField
                className='min-w-0'
                label='Difficulty'
                required
                placeholder='Select difficulty…'
                options={DIFFICULTY_OPTIONS}
                value={String(form.fields.difficulty ?? 'beginner')}
                onChange={(val) => form.setData('difficulty', val)}
                error={form.errors.difficulty}
              />
            </div>
          </div>
          <TextField
            label='YouTube link'
            type='url'
            name='youtube_url'
            placeholder='Optional — watch or youtu.be URL'
            value={youtubeUrl}
            onChange={(e) =>
              form.setData('media', mediaFromYoutubeInput(e.target.value))
            }
            error={
              form.errors['media.0.url'] || form.errors['media.0.type']
            }
          />
          <ComboboxField
            label='Equipment'
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
              form.setData('equipment_ids', (vals as string[]).map(Number))
            }
            error={form.errors.equipment_ids}
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
                  : router.push(ROUTES.ADMIN.MODULES.MOVEMENT_EXERCISES.LIST)
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
                  : 'Create Exercise'}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
