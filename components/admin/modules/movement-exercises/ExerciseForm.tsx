'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon, DumbbellIcon, SaveIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import ComboboxField, {
  type ComboboxOption,
} from '@/components/shared/form/ComboBoxField';
import FileUploadField, {
  type FileUploadFieldRemoteFile,
} from '@/components/shared/form/FileUploadField';
import SelectField, {
  type SelectFieldOption,
} from '@/components/shared/form/SelectField';
import TextAreaField from '@/components/shared/form/TextAreaField';
import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import { base } from '@/config/api/base';
import { ENDPOINTS } from '@/config/api/endpoints';
import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints/lookup';
import { ROUTES } from '@/config/routes';
import {
  ADMIN_IMAGE_UPLOAD_MAX_BYTES,
  mimeTypeFromImageFilename,
} from '@/config/uploads/admin-image-upload';
import { getMovementCategoriesLookup } from '@/domains/movement-categories/services';
import {
  type MediaItemInput,
  MovementExerciseCreateSchema,
  MovementExerciseUpdateSchema,
} from '@/domains/movement-exercises/schemas';
import {
  getMovementEquipmentLookup,
  type MovementEquipmentLookup,
} from '@/domains/movement-exercises/services';
import type { MovementExercise } from '@/domains/movement-exercises/types';
import { getMovementPrescriptionProfilesLookup } from '@/domains/movement-prescriptions/services';
import {
  PRESCRIPTION_PROFILE_LABELS,
  type PrescriptionProfile,
} from '@/domains/movement-prescriptions/types';
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

const MOVEMENT_EXERCISE_GIF_ACCEPT = '.gif';

function resolveExerciseGifDisplayUrl(
  raw: string | null | undefined,
): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  return trimmed.startsWith('http')
    ? trimmed
    : `${base.domainEndpoint}${trimmed}`;
}

function remoteGifFilesFromExercise(
  exercise?: MovementExercise,
): FileUploadFieldRemoteFile[] {
  if (!exercise?.gif?.trim()) return [];
  const fullUrl = resolveExerciseGifDisplayUrl(exercise.gif);
  if (!fullUrl) return [];
  const fileName =
    exercise.gif.split('/').pop()?.split('?')[0] ?? 'exercise.gif';
  return [
    {
      url: fullUrl,
      name: fileName,
      mimeType: mimeTypeFromImageFilename(fileName),
    },
  ];
}

/** Single UI field maps to `media: [] | [{ type, url }]` (same API shape as before). */
function mediaFromYoutubeInput(raw: string): MediaItemInput[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  return [{ type: 'video', url: trimmed }];
}

function firstMediaItem(
  media: MediaItemInput[] | null | undefined,
): MediaItemInput | null {
  const list = media ?? [];
  return list.length > 0 ? list[0] : null;
}

function formatEquipmentMeta(
  equipment_type: string | null | undefined,
  training_section: string | null | undefined,
): string | null {
  const parts = [equipment_type?.trim(), training_section?.trim()].filter(
    Boolean,
  ) as string[];

  return parts.length > 0 ? parts.join(' · ') : null;
}

function toEquipmentComboboxOption(
  equipment: Pick<
    MovementEquipmentLookup,
    'id' | 'name' | 'equipment_type' | 'training_section'
  >,
): ComboboxOption {
  const meta = formatEquipmentMeta(
    equipment.equipment_type,
    equipment.training_section,
  );

  return {
    value: String(equipment.id),
    label: equipment.name,
    keywords: [
      equipment.name,
      equipment.equipment_type ?? '',
      equipment.training_section ?? '',
    ],
    content: (
      <div className='flex min-w-0 flex-col'>
        <span className='text-[13px] font-semibold'>{equipment.name}</span>
        {meta ? (
          <span className='text-muted-foreground text-xs'>{meta}</span>
        ) : null}
      </div>
    ),
  };
}

export default function ExerciseForm({ mode, exercise, onSuccess }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = mode === 'edit';

  const [existingGif, setExistingGif] = useState<FileUploadFieldRemoteFile[]>(
    () => remoteGifFilesFromExercise(isEdit ? exercise : undefined),
  );

  const { data: categoriesData } = useQuery({
    queryKey: ['lookup', LOOKUP_ENDPOINTS.MOVEMENT_CATEGORIES],
    queryFn: async () => {
      const response = await getMovementCategoriesLookup();
      if (response.status !== 'success') return [];
      return response.data;
    },
  });

  const { data: prescriptionProfilesData } = useQuery({
    queryKey: ['lookup', LOOKUP_ENDPOINTS.MOVEMENT_PRESCRIPTION_PROFILES],
    queryFn: async () => {
      const response = await getMovementPrescriptionProfilesLookup();
      if (response.status !== 'success') return [];
      return response.data;
    },
  });

  const prescriptionProfileOptions = useMemo<SelectFieldOption[]>(() => {
    return (prescriptionProfilesData ?? []).map((profile) => {
      const name =
        profile.name?.trim() ||
        PRESCRIPTION_PROFILE_LABELS[profile.value] ||
        profile.value;

      return {
        value: profile.value,
        label: name,
        description: profile.label?.trim() || undefined,
      };
    });
  }, [prescriptionProfilesData]);

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

  const equipmentOptions = useMemo<ComboboxOption[]>(() => {
    const loaded = (equipmentData ?? []).map(toEquipmentComboboxOption);

    if (!isEdit || !exercise?.equipments.length) {
      return loaded;
    }

    const extras = exercise.equipments
      .filter(
        (item) => !loaded.some((option) => option.value === String(item.id)),
      )
      .map((item) =>
        toEquipmentComboboxOption({
          id: item.id,
          name: item.name,
          equipment_type: null,
          training_section: null,
        }),
      );

    return extras.length > 0 ? [...extras, ...loaded] : loaded;
  }, [equipmentData, isEdit, exercise]);

  const initialFields = useMemo(() => {
    if (isEdit && exercise) {
      return {
        movement_category_id:
          exercise.movement_category?.id ?? (null as number | null),
        name: exercise.name ?? '',
        description: exercise.description ?? '',
        difficulty: exercise.difficulty ?? 'beginner',
        prescription_profile:
          exercise.prescription_profile ?? ('sets_reps' as PrescriptionProfile),
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
        gif_url: exercise.gif ?? null,
        gif: undefined,
      };
    }
    return {
      movement_category_id: null as number | null,
      name: '',
      description: '',
      difficulty: undefined as
        | undefined
        | 'beginner'
        | 'intermediate'
        | 'advanced',
      prescription_profile: undefined as PrescriptionProfile | undefined,
      is_active: true,
      media: [] as MediaItemInput[],
      equipment_ids: [] as number[],
      gif_url: null,
      gif: undefined,
    };
  }, [isEdit, exercise]);

  const form = useForm(initialFields, {
    schema: isEdit
      ? MovementExerciseUpdateSchema
      : MovementExerciseCreateSchema,
  });

  useEffect(() => {
    if (!isEdit || !exercise) return;
    queueMicrotask(() => {
      setExistingGif(remoteGifFilesFromExercise(exercise));
      form.setDataAndDefaults({
        movement_category_id: exercise.movement_category?.id ?? null,
        name: exercise.name ?? '',
        description: exercise.description ?? '',
        difficulty: exercise.difficulty ?? 'beginner',
        prescription_profile:
          exercise.prescription_profile ?? ('sets_reps' as PrescriptionProfile),
        is_active: exercise.is_active ?? true,
        media: exercise.media.length
          ? [{ type: exercise.media[0].type, url: exercise.media[0].url }]
          : [],
        equipment_ids: exercise.equipments.map((e) => e.id),
        gif_url: exercise.gif ?? null,
        gif: undefined,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, exercise]);

  const mediaItems = (form.fields.media as MediaItemInput[] | null) ?? [];
  const youtubeUrl = firstMediaItem(mediaItems)?.url ?? '';

  const submit = async () => {
    if (isEdit) {
      if (!form.isDirty) {
        toast.info('There are no changes to save.');
        return;
      }

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
            toast.success('The exercise has been updated successfully.');
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
        toast.success('The exercise has been created successfully.');
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
        <div className='space-y-6 pb-8'>
          <FileUploadField
            label='Exercise GIF'
            name='gif'
            accept={MOVEMENT_EXERCISE_GIF_ACCEPT}
            maxFiles={1}
            maxFileSize={ADMIN_IMAGE_UPLOAD_MAX_BYTES}
            existingFiles={existingGif}
            onExistingFilesChange={(files) => {
              setExistingGif(files);
              if (files.length === 0) {
                form.setData('gif_url', null);
              }
            }}
            onFilesChange={(files) => {
              const file = files[0] ?? undefined;
              form.setData('gif', file);
              if (file) {
                form.setData('gif_url', null);
                form.clearErrors('gif');
              }
            }}
            description='Optional — animated demonstration (GIF only).'
            emptyHint='Browse'
            disabled={loading}
            error={form.errors.gif as string | undefined}
          />
          <TextField
            label='Exercise Name'
            required
            placeholder='Enter exercise name (e.g. Barbell Back Squat)'
            value={String(form.fields.name ?? '')}
            onChange={(e) => form.setData('name', e.target.value)}
            error={form.errors.name}
          />
          <TextAreaField
            label='Description'
            name='description'
            placeholder='Enter a brief description for this exercise'
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
                placeholder='Please select a category'
                searchPlaceholder='Search categories…'
                emptyMessage='No categories found.'
                options={categoryOptions}
                value={
                  form.fields.movement_category_id
                    ? String(form.fields.movement_category_id)
                    : null
                }
                onChange={(val) =>
                  form.setData('movement_category_id', val ? Number(val) : null)
                }
                error={form.errors.movement_category_id}
              />
            </div>
            <div className='min-w-0'>
              <SelectField
                className='min-w-0'
                label='Difficulty'
                required
                placeholder='Please select a difficulty'
                options={DIFFICULTY_OPTIONS}
                value={
                  form.fields.difficulty != null
                    ? String(form.fields.difficulty)
                    : undefined
                }
                onChange={(val) => form.setData('difficulty', val)}
                error={form.errors.difficulty}
              />
            </div>
          </div>
          <div className='grid min-w-0 gap-6 sm:grid-cols-2'>
            <div className='min-w-0'>
              <SelectField
                className='min-w-0'
                label='Prescription Profile'
                required
                placeholder='Select a profile…'
                options={prescriptionProfileOptions}
                value={
                  form.fields.prescription_profile != null
                    ? String(form.fields.prescription_profile)
                    : undefined
                }
                onChange={(val) =>
                  form.setData(
                    'prescription_profile',
                    val as PrescriptionProfile,
                  )
                }
                error={form.errors.prescription_profile}
              />
            </div>
            <div className='min-w-0'>
              <ComboboxField
                className='min-w-0'
                label='Equipment'
                multiple
                placeholder='Select equipment…'
                searchPlaceholder='Search equipment…'
                emptyMessage='No equipment found.'
                options={equipmentOptions}
                value={(
                  (form.fields.equipment_ids as number[] | null) ?? []
                ).map(String)}
                onChange={(vals) =>
                  form.setData('equipment_ids', (vals as string[]).map(Number))
                }
                error={form.errors.equipment_ids}
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
            error={form.errors['media.0.url'] || form.errors['media.0.type']}
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
                  : router.push(ROUTES.ADMIN.MODULES.MOVEMENT_EXERCISES.LIST)
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
                <DumbbellIcon className='size-3.5' />
              )}
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
