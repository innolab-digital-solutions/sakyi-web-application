'use client';

import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import { FolderPlusIcon, SaveIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import TextAreaField from '@/components/shared/form/TextAreaField';
import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ENDPOINTS } from '@/config/api/endpoints';
import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints/lookup';
import { ROUTES } from '@/config/routes';
import {
  createBlogCategory,
  getBlogCategoryById,
  updateBlogCategory,
} from '@/domains/blog-categories/services';
import type { BlogCategory } from '@/domains/blog-categories/types';

type TranslationFields = {
  name: string;
  description: string;
};

type FormState = {
  en: TranslationFields;
  my: TranslationFields;
};

type CreateProps = {
  mode: 'create';
  category?: never;
  onSuccess?: () => void;
};

type EditProps = {
  mode: 'edit';
  category: BlogCategory;
  onSuccess?: () => void;
};

type Props = CreateProps | EditProps;

type FormFieldsProps =
  | { mode: 'create'; onSuccess?: () => void }
  | {
      mode: 'edit';
      category: BlogCategory;
      initialFields: FormState;
      onSuccess?: () => void;
    };

function getErrorMessage(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const firstString = value.find((item) => typeof item === 'string');
    return typeof firstString === 'string' ? firstString : null;
  }
  return null;
}

function mapServerFieldKey(key: string): string {
  if (
    key === 'translations.0.name' ||
    key === 'translations.en.name' ||
    key === 'en.name'
  ) {
    return 'en_name';
  }
  if (
    key === 'translations.1.name' ||
    key === 'translations.my.name' ||
    key === 'my.name'
  ) {
    return 'my_name';
  }
  return key;
}

function firstLocaleTabForErrors(
  fieldErrors: Record<string, string>,
): 'en' | 'my' {
  if (fieldErrors.en_name) return 'en';
  if (fieldErrors.my_name) return 'my';
  const keys = Object.keys(fieldErrors);
  if (keys.some((k) => k.startsWith('en_'))) return 'en';
  if (keys.some((k) => k.startsWith('my_'))) return 'my';
  return 'en';
}

function mapServerErrorsToFormErrors(
  serverErrors?: Record<string, unknown>,
): Record<string, string> {
  if (!serverErrors) return {};

  const mapped: Record<string, string> = {};
  for (const [key, value] of Object.entries(serverErrors)) {
    const message = getErrorMessage(value);
    if (!message) continue;
    mapped[mapServerFieldKey(key)] = message;
  }
  return mapped;
}

function createPayloadFromFields(
  fields: FormState,
  isActive: boolean,
): {
  is_active: boolean;
  translations: Array<{
    locale: 'en' | 'my';
    name: string;
    description: string | null;
  }>;
} {
  return {
    is_active: isActive,
    translations: [
      {
        locale: 'en',
        name: fields.en.name.trim(),
        description: fields.en.description.trim() || null,
      },
      {
        locale: 'my',
        name: fields.my.name.trim(),
        description: fields.my.description.trim() || null,
      },
    ],
  };
}

function BlogCategoryEditFormLoader({
  category,
  onSuccess,
}: {
  category: BlogCategory;
  onSuccess?: () => void;
}) {
  const [enDetailQuery, myDetailQuery] = useQueries({
    queries: [
      {
        queryKey: ['blog-category-admin-detail', category.id, 'en'] as const,
        queryFn: async () => {
          const res = await getBlogCategoryById(category.id, {
            locale: 'en',
          });
          if (res.status === 'error') {
            throw new Error(
              res.message ?? 'Failed to load English translation.',
            );
          }
          return res;
        },
      },
      {
        queryKey: ['blog-category-admin-detail', category.id, 'my'] as const,
        queryFn: async () => {
          const res = await getBlogCategoryById(category.id, {
            locale: 'my',
          });
          if (res.status === 'error') {
            throw new Error(
              res.message ?? 'Failed to load Myanmar translation.',
            );
          }
          return res;
        },
      },
    ],
  });

  if (enDetailQuery.isPending || myDetailQuery.isPending) {
    return (
      <p className='text-muted-foreground text-sm'>Loading translations…</p>
    );
  }

  if (enDetailQuery.isError || myDetailQuery.isError) {
    return (
      <p className='text-destructive text-sm'>
        Could not load category translations. Close and try again.
      </p>
    );
  }

  if (
    enDetailQuery.data?.status !== 'success' ||
    myDetailQuery.data?.status !== 'success'
  ) {
    return null;
  }

  const enCat = enDetailQuery.data.data;
  const myCat = myDetailQuery.data.data;
  const initialFields: FormState = {
    en: {
      name: enCat.name ?? '',
      description: enCat.description ?? '',
    },
    my: {
      name: myCat.name ?? '',
      description: myCat.description ?? '',
    },
  };

  return (
    <BlogCategoryFormFields
      mode='edit'
      category={category}
      initialFields={initialFields}
      onSuccess={onSuccess}
    />
  );
}

function BlogCategoryFormFields(props: FormFieldsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = props.mode === 'edit';
  const category = isEdit ? props.category : undefined;

  const [fields, setFields] = useState<FormState>(() =>
    props.mode === 'edit'
      ? props.initialFields
      : {
          en: { name: '', description: '' },
          my: { name: '', description: '' },
        },
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeLocale, setActiveLocale] = useState<'en' | 'my'>('en');
  const initialPayload = isEdit
    ? createPayloadFromFields(props.initialFields, category?.is_active ?? true)
    : null;

  const setTranslation = (
    locale: 'en' | 'my',
    key: keyof TranslationFields,
    value: string,
  ) => {
    setFields((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [key]: value },
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`${locale}_${key}`];
      return next;
    });
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!fields.en.name.trim()) next['en_name'] = 'The name field is required.';
    if (!fields.my.name.trim()) next['my_name'] = 'The name field is required.';
    setErrors(next);
    const ok = Object.keys(next).length === 0;
    if (!ok) {
      setActiveLocale(firstLocaleTabForErrors(next));
    }
    return ok;
  };

  const buildPayload = () =>
    createPayloadFromFields(
      fields,
      isEdit && category ? category.is_active : true,
    );

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      const response =
        isEdit && category
          ? await updateBlogCategory(category.id, payload)
          : await createBlogCategory(payload);

      if (response.status === 'error') {
        const serverErrors = mapServerErrorsToFormErrors(response.errors);
        if (Object.keys(serverErrors).length > 0) {
          setErrors((prev) => ({ ...prev, ...serverErrors }));
          setActiveLocale(firstLocaleTabForErrors(serverErrors));
        }
        throw new Error(response.message || 'Request failed.');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.BLOG_CATEGORIES.LIST],
      });
      queryClient.invalidateQueries({
        queryKey: ['blog-category-admin-detail'],
      });
      queryClient.invalidateQueries({
        queryKey: ['lookup', LOOKUP_ENDPOINTS.BLOG_CATEGORIES],
      });
      toast.success(
        isEdit
          ? 'The blog category has been updated successfully.'
          : 'The blog category has been created successfully.',
      );
      const onSuccess = props.onSuccess;
      if (onSuccess) onSuccess();
      else router.push(ROUTES.ADMIN.MODULES.BLOG_CATEGORIES.LIST);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    if (isEdit && initialPayload) {
      const currentPayload = buildPayload();
      if (JSON.stringify(currentPayload) === JSON.stringify(initialPayload)) {
        toast.info('There are no changes to save.');
        return;
      }
    }
    mutateAsync().catch(() => {
      // field errors are already mapped to input error props
    });
  };

  const onSuccess = props.onSuccess;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className='space-y-6'>
        <Tabs
          value={activeLocale}
          onValueChange={(v) => setActiveLocale(v as 'en' | 'my')}
        >
          <TabsList
            variant='line'
            className='bg-muted! border-border mb-4 border'
          >
            <TabsTrigger
              value='en'
              className='relative flex-1 cursor-pointer gap-1.5 text-[13px] font-semibold'
            >
              English
              {errors.en_name ? (
                <span
                  className='bg-destructive size-1.5 shrink-0 rounded-full'
                  aria-hidden
                />
              ) : null}
            </TabsTrigger>
            <TabsTrigger
              value='my'
              className='relative flex-1 cursor-pointer gap-1.5 text-[13px] font-semibold'
            >
              Myanmar
              {errors.my_name ? (
                <span
                  className='bg-destructive size-1.5 shrink-0 rounded-full'
                  aria-hidden
                />
              ) : null}
            </TabsTrigger>
          </TabsList>

          <TabsContent value='en' className='space-y-4'>
            <TextField
              label='Category Name'
              required
              placeholder='Enter category name (e.g. Health & Nutrition)'
              value={fields.en.name}
              onChange={(e) => setTranslation('en', 'name', e.target.value)}
              error={errors['en_name']}
            />
            <TextAreaField
              label='Description'
              name='en_description'
              placeholder='Enter a brief description for this category'
              rows={3}
              value={fields.en.description}
              onChange={(e) =>
                setTranslation('en', 'description', e.target.value)
              }
            />
          </TabsContent>

          <TabsContent value='my' className='space-y-4'>
            <TextField
              label='Category Name'
              required
              placeholder='အမျိုးအစားအမည် (ဥပမာ ကျန်းမာရေးနှင့် အာဟာရ) ထည့်ပါ'
              value={fields.my.name}
              onChange={(e) => setTranslation('my', 'name', e.target.value)}
              error={errors['my_name']}
            />
            <TextAreaField
              label='Description'
              name='my_description'
              placeholder='ဤအမျိုးအစားအတွက် အတိုချုံးဖော်ပြချက်ကို ထည့်ပါ။'
              rows={3}
              value={fields.my.description}
              onChange={(e) =>
                setTranslation('my', 'description', e.target.value)
              }
            />
          </TabsContent>
        </Tabs>

        <div className='flex flex-nowrap items-center justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            disabled={isPending}
            className='text-foreground bg-background hover:bg-muted h-10 shrink-0 cursor-pointer gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
            onClick={() =>
              onSuccess
                ? onSuccess()
                : router.push(ROUTES.ADMIN.MODULES.BLOG_CATEGORIES.LIST)
            }
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={isPending}
            className='h-10 shrink-0 gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
          >
            {isEdit ? (
              <SaveIcon className='size-3.5' />
            ) : (
              <FolderPlusIcon className='size-3.5' />
            )}
            {isPending
              ? isEdit
                ? 'Saving Changes…'
                : 'Creating…'
              : isEdit
                ? 'Save Changes'
                : 'Create category'}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default function BlogCategoryForm(props: Props) {
  if (props.mode === 'edit') {
    return (
      <BlogCategoryEditFormLoader
        category={props.category}
        onSuccess={props.onSuccess}
      />
    );
  }
  return <BlogCategoryFormFields mode='create' onSuccess={props.onSuccess} />;
}
