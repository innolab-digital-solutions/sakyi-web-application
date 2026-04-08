'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
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

function resolveTranslation(
  category: BlogCategory,
  locale: 'en' | 'my',
): TranslationFields {
  const t = category.translations.find((tr) => tr.locale === locale);
  return { name: t?.name ?? '', description: t?.description ?? '' };
}

export default function BlogCategoryForm({ mode, category, onSuccess }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = mode === 'edit';

  const [fields, setFields] = useState<FormState>(() => {
    if (isEdit && category) {
      return {
        is_active: category.is_active,
        en: resolveTranslation(category, 'en'),
        my: resolveTranslation(category, 'my'),
      };
    }
    return {
      is_active: true,
      en: { name: '', description: '' },
      my: { name: '', description: '' },
    };
  });

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
        throw new Error(response.message || 'Request failed.');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.BLOG_CATEGORIES.LIST],
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
