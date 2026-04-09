'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangleIcon,
  ImageIcon,
  LayoutIcon,
  SettingsIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import ComboboxField, {
  type ComboboxOption,
} from '@/components/shared/form/ComboBoxField';
import FileUploadField, {
  type FileUploadFieldRemoteFile,
} from '@/components/shared/form/FileUploadField';
import FormSubmitButton from '@/components/shared/form/FormSubmitButton';
import RichTextField from '@/components/shared/form/RichTextField';
import SelectField, {
  type SelectFieldOption,
} from '@/components/shared/form/SelectField';
import TextAreaField from '@/components/shared/form/TextAreaField';
import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base } from '@/config/api/base';
import { ENDPOINTS } from '@/config/api/endpoints';
import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints/lookup';
import { LANGUAGES } from '@/config/languages';
import { ROUTES } from '@/config/routes';
import {
  BlogPostCreateSchema,
  type BlogPostTranslationInput,
  BlogPostUpdateSchema,
} from '@/domains/blogs/schemas';
import {
  type BlogCategoryLookup,
  getBlogCategoriesLookup,
} from '@/domains/blogs/services';
import type { AdminBlogPost } from '@/domains/blogs/types';
import { useForm } from '@/lib/form';

const STATUS_OPTIONS: SelectFieldOption[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const DEFAULT_TRANSLATIONS: BlogPostTranslationInput[] = LANGUAGES.map(
  (lang) => ({
    locale: lang.code,
    title: '',
    excerpt: '',
    content: '',
  }),
);

type CreateProps = {
  mode: 'create';
  post?: never;
};

type EditProps = {
  mode: 'edit';
  post: AdminBlogPost;
};

type Props = CreateProps | EditProps;

export default function BlogPostForm({ mode, post }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = mode === 'edit';

  const { data: categoriesData } = useQuery<BlogCategoryLookup[]>({
    queryKey: ['lookup', LOOKUP_ENDPOINTS.BLOG_CATEGORIES],
    queryFn: async () => {
      const response = await getBlogCategoriesLookup();
      if (response.status !== 'success') return [];
      return response.data;
    },
  });

  const categoryOptions = useMemo<ComboboxOption[]>(() => {
    if (!categoriesData) return [];
    return categoriesData.map((c) => {
      const enName =
        c.translations.find((t) => t.locale === 'en')?.name ??
        c.translations[0]?.name ??
        String(c.id);
      return { value: String(c.id), label: enName };
    });
  }, [categoriesData]);

  const [existingThumbnail, setExistingThumbnail] = useState<
    FileUploadFieldRemoteFile[]
  >([]);

  useEffect(() => {
    if (mode === 'edit' && post?.thumbnail) {
      const fullUrl = post.thumbnail.startsWith('http')
        ? post.thumbnail
        : `${base.domainEndpoint}${post.thumbnail}`;
      const fileName = post.thumbnail.split('/').pop() ?? 'thumbnail';
      setExistingThumbnail([{ url: fullUrl, name: fileName }]);
    }
  }, [mode, post?.thumbnail]);

  const initialFields = useMemo(() => {
    if (mode === 'edit' && post) {
      return {
        status: post.status,
        blog_category_id: post.blog_category?.id ?? null,
        thumbnail_url: post.thumbnail ?? null,
        translations: LANGUAGES.map((lang) => {
          const t = post.translations.find((tr) => tr.locale === lang.code);
          return {
            locale: lang.code as 'en' | 'my',
            title: t?.title ?? '',
            excerpt: t?.excerpt ?? '',
            content: t?.content ?? '',
          };
        }),
      };
    }
    return {
      status: 'draft' as const,
      blog_category_id: null as number | null,
      translations: DEFAULT_TRANSLATIONS,
    };
  }, [mode, post]);

  const form = useForm(initialFields, {
    schema: isEdit ? BlogPostUpdateSchema : BlogPostCreateSchema,
  });

  useEffect(() => {
    if (mode !== 'edit' || !post) return;
    form.setDataAndDefaults({
      status: post.status,
      blog_category_id: post.blog_category?.id ?? null,
      thumbnail_url: post.thumbnail ?? null,
      translations: LANGUAGES.map((lang) => {
        const t = post.translations.find((tr) => tr.locale === lang.code);
        return {
          locale: lang.code as 'en' | 'my',
          title: t?.title ?? '',
          excerpt: t?.excerpt ?? '',
          content: t?.content ?? '',
        };
      }),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, post]);

  const translations = form.fields.translations as BlogPostTranslationInput[];

  const updateTranslation = (
    locale: string,
    field: keyof Omit<BlogPostTranslationInput, 'locale'>,
    value: string,
  ) => {
    const updated = translations.map((t) =>
      t.locale === locale ? { ...t, [field]: value } : t,
    );
    form.setData('translations', updated);
  };

  const getTranslationError = (
    locale: string,
    field: keyof Omit<BlogPostTranslationInput, 'locale'>,
  ) => {
    const idx = translations.findIndex((t) => t.locale === locale);
    if (idx === -1) return undefined;
    const key = `translations.${idx}.${field}` as never;
    return form.errors[key] as string | undefined;
  };

  const isTranslationEmpty = (locale: string) => {
    const t = translations.find((tr) => tr.locale === locale);
    return !t?.title?.trim() && !t?.content?.trim();
  };

  const submit = async () => {
    const myTranslation = translations.find((t) => t.locale === 'my');
    if (!myTranslation?.title?.trim() || !myTranslation?.content?.trim()) {
      toast.error('Myanmar translation is required.', {
        description:
          'Please fill in the Myanmar title and content before saving.',
        duration: 5000,
      });
      return;
    }

    const callbacks = {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['table', ENDPOINTS.ADMIN.MODULES.BLOG_POSTS.LIST],
        });
        if (isEdit) {
          queryClient.invalidateQueries({
            queryKey: [
              ENDPOINTS.ADMIN.MODULES.BLOG_POSTS.DETAIL(String(post.id)),
              post.id,
            ],
          });
        }
        toast.success(
          isEdit ? 'Post updated successfully.' : 'Post created successfully.',
        );
        router.push(ROUTES.ADMIN.MODULES.BLOG_POSTS.LIST);
      },
      onFailure: (error: { message?: string }) => {
        toast.error(
          error.message ??
            (isEdit ? 'Failed to update post.' : 'Failed to create post.'),
        );
      },
    };

    if (isEdit) {
      await form.patch(
        ENDPOINTS.ADMIN.MODULES.BLOG_POSTS.DETAIL(String(post.id)),
        callbacks,
      );
    } else {
      await form.post(ENDPOINTS.ADMIN.MODULES.BLOG_POSTS.CREATE, callbacks);
    }
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
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]'>
        {/* ── Main content column ── */}
        <div className='min-w-0 space-y-6'>
          {/* Translations card */}
          <Card>
            <CardHeader className='border-b py-4'>
              <div className='flex items-center gap-2.5'>
                <div className='bg-primary/10 text-primary flex size-7 items-center justify-center rounded-md'>
                  <LayoutIcon className='size-3.5' />
                </div>
                <div>
                  <CardTitle className='text-sm font-semibold'>
                    Content
                  </CardTitle>
                  <CardDescription className='mt-0.5 text-xs'>
                    Write the title, excerpt, and body for each language.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='pt-5'>
              <Tabs defaultValue='en'>
                <TabsList className='mb-5 h-9 w-full justify-start rounded-lg p-1'>
                  {LANGUAGES.map((lang) => {
                    const isEmpty = isTranslationEmpty(lang.code);
                    const hasErrors =
                      getTranslationError(lang.code, 'title') ||
                      getTranslationError(lang.code, 'content');
                    return (
                      <TabsTrigger
                        key={lang.code}
                        value={lang.code}
                        className='relative cursor-pointer gap-1.5 text-xs'
                      >
                        {lang.name}
                        {(isEmpty || hasErrors) && lang.code !== 'en' && (
                          <span className='size-1.5 rounded-full bg-amber-400' />
                        )}
                        {hasErrors && (
                          <span className='bg-destructive size-1.5 rounded-full' />
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {LANGUAGES.map((lang) => {
                  const t = translations.find((tr) => tr.locale === lang.code);
                  return (
                    <TabsContent
                      key={lang.code}
                      value={lang.code}
                      className='space-y-5'
                    >
                      {lang.code === 'my' && isTranslationEmpty('my') && (
                        <div className='flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400'>
                          <AlertTriangleIcon className='mt-0.5 size-3.5 shrink-0' />
                          <span>
                            Myanmar translation is empty. Fill in the title and
                            content to reach Myanmar-speaking readers.
                          </span>
                        </div>
                      )}
                      <TextField
                        label='Title'
                        required={lang.code === 'en'}
                        placeholder={
                          lang.code === 'en'
                            ? 'e.g. Getting Started with Wellness'
                            : 'ဥပမာ — ကျန်းမာရေးနှင့် ကောင်းကျိုး'
                        }
                        value={t?.title ?? ''}
                        onChange={(e) =>
                          updateTranslation(lang.code, 'title', e.target.value)
                        }
                        error={getTranslationError(lang.code, 'title')}
                      />
                      <TextAreaField
                        label='Excerpt'
                        placeholder='Short summary shown in post listings…'
                        rows={3}
                        value={t?.excerpt ?? ''}
                        onChange={(e) =>
                          updateTranslation(
                            lang.code,
                            'excerpt',
                            e.target.value,
                          )
                        }
                        error={getTranslationError(lang.code, 'excerpt')}
                      />
                      <RichTextField
                        label='Content'
                        required={lang.code === 'en'}
                        value={t?.content ?? ''}
                        onChange={(val) =>
                          updateTranslation(lang.code, 'content', val)
                        }
                        error={getTranslationError(lang.code, 'content')}
                      />
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* ── Sidebar column ── */}
        <div className='space-y-4 lg:sticky lg:top-6 lg:self-start'>
          {/* Publish card */}
          <Card>
            <CardHeader className='border-b py-4'>
              <div className='flex items-center gap-2.5'>
                <div className='bg-primary/10 text-primary flex size-7 items-center justify-center rounded-md'>
                  <SettingsIcon className='size-3.5' />
                </div>
                <CardTitle className='text-sm font-semibold'>Publish</CardTitle>
              </div>
            </CardHeader>
            <CardContent className='space-y-4 pt-4 pb-5'>
              <SelectField
                label='Status'
                name='status'
                required
                placeholder='Select status…'
                options={STATUS_OPTIONS}
                value={String(form.fields.status ?? 'draft')}
                onChange={(val) =>
                  form.setData(
                    'status',
                    val as 'draft' | 'published' | 'archived',
                  )
                }
                error={form.errors.status}
              />
              <ComboboxField
                label='Category'
                required
                placeholder='Select category…'
                searchPlaceholder='Search categories…'
                emptyMessage='No categories found.'
                options={categoryOptions}
                value={
                  form.fields.blog_category_id
                    ? String(form.fields.blog_category_id)
                    : ''
                }
                onChange={(val) =>
                  form.setData('blog_category_id', val ? Number(val) : null)
                }
                error={form.errors.blog_category_id as string | undefined}
              />
            </CardContent>
          </Card>

          {/* Thumbnail card */}
          <Card>
            <CardHeader className='border-b py-4'>
              <div className='flex items-center gap-2.5'>
                <div className='bg-primary/10 text-primary flex size-7 items-center justify-center rounded-md'>
                  <ImageIcon className='size-3.5' />
                </div>
                <CardTitle className='text-sm font-semibold'>
                  Thumbnail
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className='pt-4 pb-5'>
              <FileUploadField
                accept='image/*'
                maxFileSize={5 * 1024 * 1024}
                existingFiles={existingThumbnail}
                onExistingFilesChange={(files) => {
                  setExistingThumbnail(files);
                  if (files.length === 0) {
                    form.setData('thumbnail_url', null);
                  }
                }}
                onFilesChange={(files) => {
                  const file = files[0] ?? null;
                  form.setData('thumbnail', file);
                  if (file) form.setData('thumbnail_url', null);
                }}
                emptyHint='Click or drag image here'
                error={
                  (form.errors.thumbnail ?? form.errors.thumbnail_url) as
                    | string
                    | undefined
                }
              />
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className='space-y-2'>
            <FormSubmitButton isSubmitting={loading}>
              {isEdit ? 'Save Changes' : 'Publish Post'}
            </FormSubmitButton>
            <Button
              type='button'
              variant='outline'
              className='w-full cursor-pointer'
              disabled={loading}
              onClick={() => router.push(ROUTES.ADMIN.MODULES.BLOG_POSTS.LIST)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
