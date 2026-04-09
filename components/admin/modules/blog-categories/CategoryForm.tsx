'use client';

import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import SelectField, {
  type SelectFieldOption,
} from '@/components/shared/form/SelectField';
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

const STATUS_OPTIONS: SelectFieldOption[] = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

type TranslationFields = {
  name: string;
  description: string;
};

type FormState = {
  is_active: boolean;
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
    is_active: category.is_active,
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
          is_active: true,
          en: { name: '', description: '' },
          my: { name: '', description: '' },
        },
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (!fields.en.name.trim()) next['en_name'] = 'English name is required.';
    if (!fields.my.name.trim()) next['my_name'] = 'Myanmar name is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = () => ({
    is_active: fields.is_active,
    translations: [
      {
        locale: 'en' as const,
        name: fields.en.name.trim(),
        description: fields.en.description.trim() || null,
      },
      {
        locale: 'my' as const,
        name: fields.my.name.trim(),
        description: fields.my.description.trim() || null,
      },
    ],
  });

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
          ? 'Category updated successfully.'
          : 'Category created successfully.',
      );
      const onSuccess = props.onSuccess;
      if (onSuccess) onSuccess();
      else router.push(ROUTES.ADMIN.MODULES.BLOG_CATEGORIES.LIST);
    },
    onError: (error) => {
      toast.error(error.message ?? 'Something went wrong.');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    mutateAsync();
  };

  const onSuccess = props.onSuccess;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className='space-y-6'>
        <Tabs defaultValue='en'>
          <TabsList className='mb-4 w-full'>
            <TabsTrigger value='en' className='flex-1 cursor-pointer'>
              English
            </TabsTrigger>
            <TabsTrigger value='my' className='flex-1 cursor-pointer'>
              Myanmar
            </TabsTrigger>
          </TabsList>

          <TabsContent value='en' className='space-y-4'>
            <TextField
              label='Name'
              required
              placeholder='e.g. Health & Nutrition'
              value={fields.en.name}
              onChange={(e) => setTranslation('en', 'name', e.target.value)}
              error={errors['en_name']}
            />
            <TextAreaField
              label='Description'
              name='en_description'
              placeholder='Optional description…'
              rows={3}
              value={fields.en.description}
              onChange={(e) =>
                setTranslation('en', 'description', e.target.value)
              }
            />
          </TabsContent>

          <TabsContent value='my' className='space-y-4'>
            <TextField
              label='Name'
              required
              placeholder='e.g. ကျန်းမာရေးနှင့် အာဟာရ'
              value={fields.my.name}
              onChange={(e) => setTranslation('my', 'name', e.target.value)}
              error={errors['my_name']}
            />
            <TextAreaField
              label='Description'
              name='my_description'
              placeholder='Optional description…'
              rows={3}
              value={fields.my.description}
              onChange={(e) =>
                setTranslation('my', 'description', e.target.value)
              }
            />
          </TabsContent>
        </Tabs>

        <SelectField
          label='Status'
          name='is_active'
          required
          placeholder='Select status…'
          options={STATUS_OPTIONS}
          value={String(fields.is_active)}
          onChange={(val) =>
            setFields((prev) => ({ ...prev, is_active: val === 'true' }))
          }
        />

        <div className='flex items-center justify-end gap-3'>
          <Button
            type='button'
            variant='outline'
            disabled={isPending}
            className='cursor-pointer'
            onClick={() =>
              onSuccess
                ? onSuccess()
                : router.push(ROUTES.ADMIN.MODULES.BLOG_CATEGORIES.LIST)
            }
          >
            Cancel
          </Button>
          <Button type='submit' className='cursor-pointer' disabled={isPending}>
            {isPending
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
