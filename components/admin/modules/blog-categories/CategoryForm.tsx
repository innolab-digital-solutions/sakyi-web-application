'use client';

import {
  useMutation,
  useQueries,
  useQueryClient,
} from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
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

export default function BlogCategoryForm({ mode, category, onSuccess }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = mode === 'edit';

  const [fields, setFields] = useState<FormState>(() => {
    if (isEdit && category) {
      return {
        is_active: category.is_active,
        en: { name: '', description: '' },
        my: { name: '', description: '' },
      };
    }
    return {
      is_active: true,
      en: { name: '', description: '' },
      my: { name: '', description: '' },
    };
  });

  const detailHydratedRef = useRef(false);

  const [enDetailQuery, myDetailQuery] = useQueries({
    queries: [
      {
        queryKey: ['blog-category-admin-detail', category?.id, 'en'] as const,
        enabled: isEdit && category != null,
        queryFn: async () => {
          const res = await getBlogCategoryById(category!.id, {
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
        queryKey: ['blog-category-admin-detail', category?.id, 'my'] as const,
        enabled: isEdit && category != null,
        queryFn: async () => {
          const res = await getBlogCategoryById(category!.id, {
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

  useEffect(() => {
    detailHydratedRef.current = false;
  }, [category?.id]);

  useEffect(() => {
    if (!isEdit || !category) return;
    if (
      enDetailQuery.data?.status !== 'success' ||
      myDetailQuery.data?.status !== 'success'
    ) {
      return;
    }
    if (detailHydratedRef.current) return;
    detailHydratedRef.current = true;
    const enCat = enDetailQuery.data.data;
    const myCat = myDetailQuery.data.data;
    setFields({
      is_active: category.is_active,
      en: {
        name: enCat.name ?? '',
        description: enCat.description ?? '',
      },
      my: {
        name: myCat.name ?? '',
        description: myCat.description ?? '',
      },
    });
  }, [isEdit, category, enDetailQuery.data, myDetailQuery.data]);

  const editDetailLoading =
    isEdit && (enDetailQuery.isPending || myDetailQuery.isPending);
  const editDetailError =
    isEdit && (enDetailQuery.isError || myDetailQuery.isError);

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
      const response = isEdit
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

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className='space-y-6'>
        {editDetailLoading && (
          <p className='text-muted-foreground text-sm'>Loading translations…</p>
        )}
        {editDetailError && (
          <p className='text-destructive text-sm'>
            Could not load category translations. Close and try again.
          </p>
        )}
        {/* Translations — tabbed by locale */}
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
          <Button
            type='submit'
            className='cursor-pointer'
            disabled={isPending || editDetailLoading || editDetailError}
          >
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
