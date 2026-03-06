'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { SyntheticEvent, useMemo, useState } from 'react';

import SubmitButton from '@/components/shared/form/SubmitButton';
import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ENDPOINTS, { LOOKUP_ENDPOINTS } from '@/config/endpoints';
import PATHS from '@/config/paths';
import { useForm } from '@/hooks/form';
import { http } from '@/lib/api/client';
import {
  ProgramCreateSchema,
  type ProgramCreateSchemaType,
  type ProgramLocale,
  type ProgramTranslation,
  ProgramUpdateSchema,
  type ProgramUpdateSchemaType,
} from '@/lib/schemas/admin/modules/program';
import type { Program } from '@/types/admin/program';
import type { Goal } from '@/types/lookup/goal';

type ProgramFormProps =
  | {
      mode: 'create';
    }
  | {
      mode: 'edit';
      program: Program;
    };

const SUPPORTED_LOCALES: ProgramLocale[] = ['en', 'my'];

const createEmptyTranslation = (locale: ProgramLocale): ProgramTranslation => ({
  locale,
  tagline: '',
  title: '',
  excerpt: '',
  about: '',
  features: [''],
  ideals: [''],
  expectations: [''],
  structures: [''],
});

const buildCreateInitialValues = (): ProgramCreateSchemaType => ({
  goal_ids: [],
  // Placeholder; real file is provided by the user before submit.
  thumbnail: undefined as unknown as File,
  duration: '',
  price: 0,
  status: 'draft',
  published_at: null,
  archived_at: null,
  translations: SUPPORTED_LOCALES.map(createEmptyTranslation),
});

const buildUpdateInitialValues = (
  program: Program,
): ProgramUpdateSchemaType => {
  const englishTranslation: ProgramTranslation = {
    locale: 'en',
    tagline: program.tagline ?? '',
    title: program.title ?? '',
    excerpt: program.overview ?? '',
    about: program.description ?? '',
    features:
      program.features && program.features.length > 0 ? program.features : [''],
    ideals: program.ideals && program.ideals.length > 0 ? program.ideals : [''],
    expectations:
      program.expectations && program.expectations.length > 0
        ? program.expectations
        : [''],
    structures:
      program.structures && program.structures.length > 0
        ? program.structures
        : [''],
  };

  return {
    goal_ids: (program.goals ?? []).map((goal) => goal.id),
    duration: program.duration ?? '',
    price: program.price ?? 0,
    status: program.status ?? 'draft',
    published_at: program.timestamps.published_at,
    archived_at: program.timestamps.archived_at,
    translations: [englishTranslation],
  };
};

const buildCreateFormData = (values: ProgramCreateSchemaType): FormData => {
  const formData = new FormData();

  values.goal_ids.forEach((id) => {
    formData.append('goal_ids[]', String(id));
  });

  if (values.thumbnail instanceof File) {
    formData.append('thumbnail', values.thumbnail);
  }

  if (values.duration) {
    formData.append('duration', values.duration.trim());
  }

  formData.append('price', String(values.price));
  formData.append('status', values.status);

  if (values.published_at != null && values.published_at !== '') {
    formData.append('published_at', values.published_at);
  }

  if (values.archived_at != null && values.archived_at !== '') {
    formData.append('archived_at', values.archived_at);
  }

  values.translations.forEach((translation, index) => {
    formData.append(`translations[${index}][locale]`, translation.locale);
    formData.append(`translations[${index}][tagline]`, translation.tagline);
    formData.append(`translations[${index}][title]`, translation.title);
    formData.append(`translations[${index}][excerpt]`, translation.excerpt);
    formData.append(`translations[${index}][about]`, translation.about);

    translation.features.forEach((feature, featureIndex) => {
      formData.append(
        `translations[${index}][features][${featureIndex}]`,
        feature,
      );
    });

    translation.ideals.forEach((ideal, idealIndex) => {
      formData.append(`translations[${index}][ideals][${idealIndex}]`, ideal);
    });

    translation.expectations.forEach((expectation, expectationIndex) => {
      formData.append(
        `translations[${index}][expectations][${expectationIndex}]`,
        expectation,
      );
    });

    translation.structures.forEach((structure, structureIndex) => {
      formData.append(
        `translations[${index}][structures][${structureIndex}]`,
        structure,
      );
    });
  });

  return formData;
};

const buildUpdateFormData = (values: ProgramUpdateSchemaType): FormData => {
  const formData = new FormData();

  if (values.goal_ids && values.goal_ids.length > 0) {
    values.goal_ids.forEach((id) => {
      formData.append('goal_ids[]', String(id));
    });
  }

  if (values.thumbnail instanceof File) {
    formData.append('thumbnail', values.thumbnail);
  }

  if (values.duration) {
    formData.append('duration', values.duration.trim());
  }

  if (typeof values.price === 'number') {
    formData.append('price', String(values.price));
  }

  if (values.status) {
    formData.append('status', values.status);
  }

  if (values.published_at !== undefined) {
    if (values.published_at != null && values.published_at !== '') {
      formData.append('published_at', values.published_at);
    } else {
      formData.append('published_at', '');
    }
  }

  if (values.archived_at !== undefined) {
    if (values.archived_at != null && values.archived_at !== '') {
      formData.append('archived_at', values.archived_at);
    } else {
      formData.append('archived_at', '');
    }
  }

  if (values.translations && values.translations.length > 0) {
    values.translations.forEach((translation, index) => {
      formData.append(`translations[${index}][locale]`, translation.locale);
      formData.append(`translations[${index}][tagline]`, translation.tagline);
      formData.append(`translations[${index}][title]`, translation.title);
      formData.append(`translations[${index}][excerpt]`, translation.excerpt);
      formData.append(`translations[${index}][about]`, translation.about);

      translation.features.forEach((feature, featureIndex) => {
        formData.append(
          `translations[${index}][features][${featureIndex}]`,
          feature,
        );
      });

      translation.ideals.forEach((ideal, idealIndex) => {
        formData.append(`translations[${index}][ideals][${idealIndex}]`, ideal);
      });

      translation.expectations.forEach((expectation, expectationIndex) => {
        formData.append(
          `translations[${index}][expectations][${expectationIndex}]`,
          expectation,
        );
      });

      translation.structures.forEach((structure, structureIndex) => {
        formData.append(
          `translations[${index}][structures][${structureIndex}]`,
          structure,
        );
      });
    });
  }

  return formData;
};

type CommonFormProps<TSchema> = {
  mode: 'create' | 'edit';
  activeLocale: ProgramLocale;
  onLocaleChange: (locale: ProgramLocale) => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
  form: {
    data: TSchema & Record<string, unknown>;
    errors: Record<string, unknown>;
    processing: boolean;
    setData: (key: string, value: unknown) => void;
  };
};

const ProgramFormFields = <
  TSchema extends ProgramCreateSchemaType | ProgramUpdateSchemaType,
>(
  props: CommonFormProps<TSchema>,
) => {
  const { activeLocale, onLocaleChange, form, mode, onSubmit } = props;

  const { data: goals, isLoading: isGoalsLoading } = useQuery<Goal[]>({
    queryKey: ['lookup', 'goals'],
    queryFn: async () => {
      const response = await http.get<Goal[]>(LOOKUP_ENDPOINTS.GOALS, {
        throwOnError: false,
      });

      if (response.status === 'error') {
        throw new Error(response.message);
      }

      return response.data;
    },
    staleTime: 1000 * 60 * 60,
  });

  const primaryGoalId = useMemo(() => {
    const goalIds = (
      form.data as ProgramCreateSchemaType | ProgramUpdateSchemaType
    ).goal_ids as number[] | undefined;

    if (!Array.isArray(goalIds) || goalIds.length === 0) {
      return '';
    }

    return String(goalIds[0]);
  }, [form.data]);

  const translations = (
    form.data as ProgramCreateSchemaType | ProgramUpdateSchemaType
  ).translations as ProgramTranslation[] | undefined;

  const activeTranslationIndex = useMemo(
    () => translations?.findIndex((t) => t.locale === activeLocale) ?? 0,
    [translations, activeLocale],
  );

  const activeTranslation =
    translations && translations[activeTranslationIndex]
      ? translations[activeTranslationIndex]
      : createEmptyTranslation(activeLocale);

  const updateTranslationField = (
    field: keyof ProgramTranslation,
    value: string | string[],
  ) => {
    if (!translations || translations.length === 0) {
      const next: ProgramTranslation[] = [
        {
          ...createEmptyTranslation(activeLocale),
          [field]: value,
        } as ProgramTranslation,
      ];
      form.setData('translations', next);
      return;
    }

    const nextTranslations = translations.map((translation) =>
      translation.locale === activeLocale
        ? ({
            ...translation,
            [field]: value,
          } as ProgramTranslation)
        : translation,
    );

    form.setData('translations', nextTranslations);
  };

  const translationFeaturesValue = (activeTranslation.features ?? []).join(
    '\n',
  );
  const translationIdealsValue = (activeTranslation.ideals ?? []).join('\n');
  const translationExpectationsValue = (
    activeTranslation.expectations ?? []
  ).join('\n');
  const translationStructuresValue = (activeTranslation.structures ?? []).join(
    '\n',
  );

  const handlePriceChange = (value: string) => {
    const numeric = Number.parseInt(value.replace(/[^\d]/g, ''), 10);
    form.setData('price', Number.isNaN(numeric) ? 0 : numeric);
  };

  const handleThumbnailChange = (file?: File) => {
    if (file) {
      form.setData('thumbnail', file);
    }
  };

  const publishedAtValue = (
    form.data as ProgramCreateSchemaType | ProgramUpdateSchemaType
  ).published_at as string | null | undefined;
  const archivedAtValue = (
    form.data as ProgramCreateSchemaType | ProgramUpdateSchemaType
  ).archived_at as string | null | undefined;

  return (
    <form className='space-y-6' onSubmit={onSubmit}>
      <div className='grid gap-6 md:grid-cols-2'>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='goal_ids'>Primary Goal</Label>
            <Select
              value={primaryGoalId}
              onValueChange={(value) => {
                const id = Number.parseInt(value, 10);
                if (!Number.isNaN(id)) {
                  form.setData('goal_ids', [id]);
                }
              }}
              disabled={isGoalsLoading || form.processing}
            >
              <SelectTrigger className='min-w-48'>
                <SelectValue
                  placeholder={
                    isGoalsLoading ? 'Loading goals...' : 'Select a goal'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {goals?.map((goal) => (
                  <SelectItem key={goal.id} value={String(goal.id)}>
                    {goal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {Boolean(form.errors.goal_ids) && (
              <p className='text-destructive text-xs font-medium'>
                {String(form.errors.goal_ids ?? '')}
              </p>
            )}
          </div>

          <TextField
            label='Thumbnail'
            id='thumbnail'
            name='thumbnail'
            type='file'
            required={mode === 'create'}
            accept='image/png,image/jpg,image/jpeg'
            onChange={(event) =>
              handleThumbnailChange(event.target.files?.[0] as File | undefined)
            }
            error={form.errors.thumbnail as string}
            disabled={form.processing}
          />

          <TextField
            label='Duration'
            id='duration'
            name='duration'
            placeholder='e.g. 12 weeks'
            required={mode === 'create'}
            value={String(
              ((form.data as ProgramCreateSchemaType | ProgramUpdateSchemaType)
                .duration as string | null | undefined) ?? '',
            )}
            onChange={(event) => form.setData('duration', event.target.value)}
            error={form.errors.duration as string}
            disabled={form.processing}
          />

          <TextField
            label='Price (in cents)'
            id='price'
            name='price'
            type='number'
            required={mode === 'create'}
            value={String(
              ((form.data as ProgramCreateSchemaType | ProgramUpdateSchemaType)
                .price as number | null | undefined) ?? 0,
            )}
            onChange={(event) => handlePriceChange(event.target.value)}
            error={form.errors.price as string}
            disabled={form.processing}
          />

          <TextField
            label='Status'
            id='status'
            name='status'
            placeholder='e.g. draft, published, archived'
            required
            value={String(
              ((form.data as ProgramCreateSchemaType | ProgramUpdateSchemaType)
                .status as string | null | undefined) ?? '',
            )}
            onChange={(event) => form.setData('status', event.target.value)}
            error={form.errors.status as string}
            disabled={form.processing}
          />

          <div className='grid gap-4 md:grid-cols-2'>
            <TextField
              label='Published At'
              id='published_at'
              name='published_at'
              type='datetime-local'
              value={publishedAtValue ?? ''}
              onChange={(event) =>
                form.setData('published_at', event.target.value)
              }
              error={form.errors.published_at as string}
              disabled={form.processing}
            />
            <TextField
              label='Archived At'
              id='archived_at'
              name='archived_at'
              type='datetime-local'
              value={archivedAtValue ?? ''}
              onChange={(event) =>
                form.setData('archived_at', event.target.value)
              }
              error={form.errors.archived_at as string}
              disabled={form.processing}
            />
          </div>
        </div>

        <div className='space-y-4'>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium'>Translations</span>
            <div className='bg-muted border-border flex h-8 items-center rounded-md border p-1'>
              {SUPPORTED_LOCALES.map((locale) => {
                const isActive = locale === activeLocale;
                return (
                  <button
                    key={locale}
                    type='button'
                    onClick={() => onLocaleChange(locale)}
                    className={`rounded-sm px-3 text-xs font-medium ${
                      isActive
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-background/60'
                    }`}
                  >
                    {locale === 'en' ? 'English' : 'Myanmar'}
                  </button>
                );
              })}
            </div>
          </div>

          <TextField
            label='Tagline'
            id='tagline'
            name='tagline'
            placeholder='Short program tagline'
            required
            value={activeTranslation.tagline}
            onChange={(event) =>
              updateTranslationField('tagline', event.target.value)
            }
            disabled={form.processing}
          />

          <TextField
            label='Title'
            id='title'
            name='title'
            placeholder='Program title'
            required
            value={activeTranslation.title}
            onChange={(event) =>
              updateTranslationField('title', event.target.value)
            }
            disabled={form.processing}
          />

          <div className='space-y-2'>
            <Label htmlFor='excerpt'>Excerpt</Label>
            <textarea
              id='excerpt'
              name='excerpt'
              className='border-input focus-visible:border-ring focus-visible:ring-ring/50 text-foreground placeholder:text-muted-foreground dark:bg-input/30 flex min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]'
              placeholder='Short overview for this program'
              value={activeTranslation.excerpt}
              onChange={(event) =>
                updateTranslationField('excerpt', event.target.value)
              }
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='about'>About</Label>
            <textarea
              id='about'
              name='about'
              className='border-input focus-visible:border-ring focus-visible:ring-ring/50 text-foreground placeholder:text-muted-foreground dark:bg-input/30 flex min-h-25 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]'
              placeholder='Detailed description about this program'
              value={activeTranslation.about}
              onChange={(event) =>
                updateTranslationField('about', event.target.value)
              }
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='features'>Features (one per line)</Label>
            <textarea
              id='features'
              name='features'
              className='border-input focus-visible:border-ring focus-visible:ring-ring/50 text-foreground placeholder:text-muted-foreground dark:bg-input/30 flex min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]'
              placeholder='List the key features of this program'
              value={translationFeaturesValue}
              onChange={(event) =>
                updateTranslationField(
                  'features',
                  event.target.value
                    .split('\n')
                    .map((line) => line.trim())
                    .filter((line) => line.length > 0),
                )
              }
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='ideals'>Ideals (one per line)</Label>
            <textarea
              id='ideals'
              name='ideals'
              className='border-input focus-visible:border-ring focus-visible:ring-ring/50 text-foreground placeholder:text-muted-foreground dark:bg-input/30 flex min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]'
              placeholder='List the ideals for this program'
              value={translationIdealsValue}
              onChange={(event) =>
                updateTranslationField(
                  'ideals',
                  event.target.value
                    .split('\n')
                    .map((line) => line.trim())
                    .filter((line) => line.length > 0),
                )
              }
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='expectations'>Expectations (one per line)</Label>
            <textarea
              id='expectations'
              name='expectations'
              className='border-input focus-visible:border-ring focus-visible:ring-ring/50 text-foreground placeholder:text-muted-foreground dark:bg-input/30 flex min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]'
              placeholder='What should clients expect from this program?'
              value={translationExpectationsValue}
              onChange={(event) =>
                updateTranslationField(
                  'expectations',
                  event.target.value
                    .split('\n')
                    .map((line) => line.trim())
                    .filter((line) => line.length > 0),
                )
              }
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='structures'>Structures (one per line)</Label>
            <textarea
              id='structures'
              name='structures'
              className='border-input focus-visible:border-ring focus-visible:ring-ring/50 text-foreground placeholder:text-muted-foreground dark:bg-input/30 flex min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]'
              placeholder='Describe the structures or components of this program'
              value={translationStructuresValue}
              onChange={(event) =>
                updateTranslationField(
                  'structures',
                  event.target.value
                    .split('\n')
                    .map((line) => line.trim())
                    .filter((line) => line.length > 0),
                )
              }
            />
          </div>
        </div>
      </div>

      <div className='flex items-center justify-end gap-3'>
        <Button
          type='button'
          variant='outline'
          onClick={() => {
            window.history.back();
          }}
          disabled={form.processing}
        >
          Cancel
        </Button>
        <SubmitButton processing={form.processing}>
          {mode === 'create' ? 'Create Program' : 'Update Program'}
        </SubmitButton>
      </div>
    </form>
  );
};

const ProgramCreateFormInner = () => {
  const router = useRouter();
  const [activeLocale, setActiveLocale] = useState<ProgramLocale>('en');

  const form = useForm(buildCreateInitialValues(), {
    schema: ProgramCreateSchema,
  });

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    form
      .transform((values) =>
        buildCreateFormData(values as ProgramCreateSchemaType),
      )
      .post(ENDPOINTS.ADMIN.PROGRAMS.CREATE, {
        onSuccess: () => {
          router.replace(PATHS.ADMIN.PROGRAMS);
        },
      });
  };

  return (
    <ProgramFormFields
      mode='create'
      activeLocale={activeLocale}
      onLocaleChange={setActiveLocale}
      onSubmit={handleSubmit}
      form={form as unknown as CommonFormProps<ProgramCreateSchemaType>['form']}
    />
  );
};

const ProgramEditFormInner = ({ program }: { program: Program }) => {
  const router = useRouter();
  const [activeLocale, setActiveLocale] = useState<ProgramLocale>('en');

  const form = useForm(
    buildUpdateInitialValues(program) as ProgramUpdateSchemaType &
      Record<string, unknown>,
    {
      schema: ProgramUpdateSchema,
    },
  );

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    form
      .transform((values) =>
        buildUpdateFormData(values as ProgramUpdateSchemaType),
      )
      .put(
        ENDPOINTS.ADMIN.PROGRAMS.UPDATE.replace('{id}', String(program.id)),
        {
          onSuccess: () => {
            router.replace(PATHS.ADMIN.PROGRAMS);
          },
        },
      );
  };

  return (
    <ProgramFormFields
      mode='edit'
      activeLocale={activeLocale}
      onLocaleChange={setActiveLocale}
      onSubmit={handleSubmit}
      form={form as unknown as CommonFormProps<ProgramUpdateSchemaType>['form']}
    />
  );
};

const ProgramForm = (props: ProgramFormProps) => {
  if (props.mode === 'create') {
    return <ProgramCreateFormInner />;
  }

  return <ProgramEditFormInner program={props.program} />;
};

export default ProgramForm;
