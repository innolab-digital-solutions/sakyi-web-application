'use client';

import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangleIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import ComboboxField, {
  type ComboboxOption,
} from '@/components/shared/form/ComboBoxField';
import FileUploadField, {
  type FileUploadFieldRemoteFile,
} from '@/components/shared/form/FileUploadField';
import RichTextField from '@/components/shared/form/RichTextField';
import TextAreaField from '@/components/shared/form/TextAreaField';
import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  getAdminBlogPostById,
  getBlogCategoriesLookup,
} from '@/domains/blogs/services';
import type { AdminBlogPost } from '@/domains/blogs/types';
import type { ApiError, FormErrors } from '@/lib/form';
import { useForm } from '@/lib/form';

function firstLocaleTabForBlogPostErrors(fieldErrors: FormErrors): 'en' | 'my' {
  const keys = Object.keys(fieldErrors).filter((k) => fieldErrors[k]);
  let hasEn = false;
  let hasMy = false;
  for (const key of keys) {
    if (!key.startsWith('translations.')) continue;
    const m = /^translations\.(\d+)\./.exec(key);
    if (!m) continue;
    const code = LANGUAGES[Number(m[1])]?.code;
    if (code === 'en') hasEn = true;
    if (code === 'my') hasMy = true;
  }
  if (hasEn) return 'en';
  if (hasMy) return 'my';
  return 'en';
}

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
};

type EditProps = {
  mode: 'edit';
  postId: number;
};

type Props = CreateProps | EditProps;

type BlogPostFormFieldsProps =
  | { mode: 'create' }
  | {
      mode: 'edit';
      postId: number;
      enPost: AdminBlogPost;
      myPost: AdminBlogPost;
    };

function buildTranslationsFromPosts(
  enPost: AdminBlogPost,
  myPost: AdminBlogPost,
): BlogPostTranslationInput[] {
  return LANGUAGES.map((lang) => {
    const src = lang.code === 'en' ? enPost : myPost;
    return {
      locale: lang.code as 'en' | 'my',
      title: src.title ?? '',
      excerpt: src.excerpt ?? '',
      content: src.content ?? '',
    };
  });
}

function BlogPostEditFormLoader({ postId }: { postId: number }) {
  const [enDetailQuery, myDetailQuery] = useQueries({
    queries: [
      {
        queryKey: ['blog-post-admin-detail', postId, 'en'] as const,
        queryFn: async () => {
          const res = await getAdminBlogPostById(postId, { locale: 'en' });
          if (res.status === 'error') {
            throw new Error(
              res.message ?? 'Failed to load English post content.',
            );
          }
          return res;
        },
      },
      {
        queryKey: ['blog-post-admin-detail', postId, 'my'] as const,
        queryFn: async () => {
          const res = await getAdminBlogPostById(postId, { locale: 'my' });
          if (res.status === 'error') {
            throw new Error(
              res.message ?? 'Failed to load Myanmar post content.',
            );
          }
          return res;
        },
      },
    ],
  });

  if (enDetailQuery.isPending || myDetailQuery.isPending) {
    return (
      <p className='text-muted-foreground text-sm'>Loading post content…</p>
    );
  }

  if (enDetailQuery.isError || myDetailQuery.isError) {
    return (
      <p className='text-destructive text-sm'>
        Could not load this post for editing. Close and try again.
      </p>
    );
  }

  if (
    enDetailQuery.data?.status !== 'success' ||
    myDetailQuery.data?.status !== 'success'
  ) {
    return null;
  }

  const enPost = enDetailQuery.data.data;
  const myPost = myDetailQuery.data.data;

  return (
    <BlogPostFormFields
      key={postId}
      mode='edit'
      postId={postId}
      enPost={enPost}
      myPost={myPost}
    />
  );
}

function BlogPostFormFields(props: BlogPostFormFieldsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = props.mode === 'edit';
  const postId = isEdit ? props.postId : undefined;
  const enPost = isEdit ? props.enPost : undefined;
  const myPost = isEdit ? props.myPost : undefined;

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
    return categoriesData.map((c) => ({
      value: String(c.id),
      label: c.name,
    }));
  }, [categoriesData]);

  const [existingThumbnail, setExistingThumbnail] = useState<
    FileUploadFieldRemoteFile[]
  >(() => {
    if (!isEdit || !enPost?.thumbnail) return [];
    const fullUrl = enPost.thumbnail.startsWith('http')
      ? enPost.thumbnail
      : `${base.domainEndpoint}${enPost.thumbnail}`;
    const fileName = enPost.thumbnail.split('/').pop() ?? 'thumbnail';
    return [{ url: fullUrl, name: fileName }];
  });

  const [activeLocale, setActiveLocale] = useState<'en' | 'my'>('en');

  const initialFields = useMemo(() => {
    if (isEdit && enPost && myPost) {
      return {
        status: enPost.status,
        blog_category_id: enPost.blog_category?.id ?? null,
        thumbnail_url: enPost.thumbnail ?? null,
        translations: buildTranslationsFromPosts(enPost, myPost),
      };
    }
    return {
      status: 'draft' as const,
      blog_category_id: null as number | null,
      translations: DEFAULT_TRANSLATIONS,
    };
  }, [isEdit, enPost, myPost]);

  const form = useForm(initialFields, {
    schema: isEdit ? BlogPostUpdateSchema : BlogPostCreateSchema,
  });

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

  const hasLocaleFieldErrors = (locale: string) =>
    Boolean(
      getTranslationError(locale, 'title') ||
        getTranslationError(locale, 'content') ||
        getTranslationError(locale, 'excerpt'),
    );

  const submit = async () => {
    const handleFormError = (error: ApiError) => {
      const errs = error.errors as FormErrors | undefined;
      if (errs && Object.keys(errs).length > 0) {
        const hasTranslationIssue = Object.keys(errs).some((k) =>
          k.startsWith('translations.'),
        );
        if (hasTranslationIssue) {
          setActiveLocale(firstLocaleTabForBlogPostErrors(errs));
        }
        toast.error(
          error.message ??
            'One or more fields require your attention. Please correct the highlighted issues.',
          {
            description: hasTranslationIssue
              ? 'Each language needs a complete title and body. The tab with missing information is opened below.'
              : 'Check the highlighted fields in the form.',
            duration: 5000,
          },
        );
        return;
      }
      toast.error(
        error.message ??
          'One or more fields require your attention. Please correct the highlighted issues.',
        { duration: 5000 },
      );
    };

    const callbacks = {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['table', ENDPOINTS.ADMIN.MODULES.BLOG_POSTS.LIST],
        });
        if (isEdit && postId != null) {
          queryClient.invalidateQueries({
            queryKey: ['blog-post-admin-detail', postId],
          });
        }
        toast.success(
          isEdit ? 'Post updated successfully.' : 'Post created successfully.',
        );
        router.push(ROUTES.ADMIN.MODULES.BLOG_POSTS.LIST);
      },
      onError: handleFormError,
      onFailure: (error: ApiError) => {
        toast.error(
          error.message ??
            (isEdit ? 'Failed to update post.' : 'Failed to create post.'),
        );
      },
    };

    if (isEdit && postId != null) {
      await form.patch(
        ENDPOINTS.ADMIN.MODULES.BLOG_POSTS.DETAIL(String(postId)),
        callbacks,
      );
    } else {
      await form.post(ENDPOINTS.ADMIN.MODULES.BLOG_POSTS.CREATE, callbacks);
    }
  };

  const loading = form.isSubmitting;
  const status = form.fields.status ?? 'draft';
  const isArchived = status === 'archived';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      noValidate
    >
      <section className='border-border max-w-full min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-5'>
        <div className='space-y-6'>
          <div>
            <h3 className='text-foreground capitalize text-sm font-semibold'>
              Post content
            </h3>
            <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
              Write the title, excerpt, and body for each language, then set
              category and visibility below.
            </p>

            <div className='mt-5'>
              <Tabs
                value={activeLocale}
                onValueChange={(v) => setActiveLocale(v as 'en' | 'my')}
              >
                <TabsList
                  variant='line'
                  className='mb-4 w-full bg-muted! border border-border'
                >
                  <TabsTrigger
                    value='en'
                    className='relative flex-1 cursor-pointer gap-1.5 text-[13px] font-semibold'
                  >
                    English
                    {hasLocaleFieldErrors('en') ? (
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
                    {hasLocaleFieldErrors('my') ? (
                      <span
                        className='bg-destructive size-1.5 shrink-0 rounded-full'
                        aria-hidden
                      />
                    ) : null}
                  </TabsTrigger>
                </TabsList>

                {LANGUAGES.map((lang) => {
                  const t = translations.find((tr) => tr.locale === lang.code);
                  const slugForLocale =
                    isEdit && enPost && myPost
                      ? lang.code === 'en'
                        ? enPost.slug
                        : myPost.slug
                      : undefined;

                  return (
                    <TabsContent
                      key={lang.code}
                      value={lang.code}
                      className='space-y-4'
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
                      {isEdit &&
                        slugForLocale &&
                        slugForLocale.trim().length > 0 && (
                          <div className='space-y-1.5'>
                            <p className='text-muted-foreground text-xs font-medium'>
                              Slug
                            </p>
                            <div className='border-border bg-muted/50 text-muted-foreground truncate rounded-md border px-3 py-2 font-mono text-xs'>
                              {slugForLocale}
                            </div>
                            <p className='text-muted-foreground text-xs'>
                              Auto-generated from title. Updates on save.
                            </p>
                          </div>
                        )}
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
            </div>
          </div>

          <div className='border-border space-y-4 border-t pt-6'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='min-w-0 space-y-1'>
                <Label
                  htmlFor='blog-post-published'
                  className='text-foreground text-sm font-semibold'
                >
                  Published
                </Label>
                <p className='text-muted-foreground text-xs leading-relaxed font-medium'>
                  When on, the post is live for visitors. When off, it stays a
                  draft.
                </p>
                {isArchived ? (
                  <p className='text-muted-foreground text-xs leading-relaxed font-medium'>
                    This post is currently archived. Turn Published on to
                    restore it as live content, or save to keep it archived.
                  </p>
                ) : null}
              </div>
              <Switch
                id='blog-post-published'
                className='shrink-0'
                checked={status === 'published'}
                onCheckedChange={(checked) =>
                  form.setData('status', checked ? 'published' : 'draft')
                }
              />
            </div>
            {form.errors.status ? (
              <p className='text-destructive text-xs font-medium'>
                {form.errors.status}
              </p>
            ) : null}

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

            <div className='space-y-1.5'>
              <p className='text-foreground text-sm font-semibold'>Thumbnail</p>
              <p className='text-muted-foreground text-xs leading-relaxed font-medium'>
                Optional image for listings and previews.
              </p>
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
            </div>
          </div>

          <div className='border-border flex flex-nowrap items-center justify-end gap-2 border-t pt-6'>
            <Button
              type='button'
              variant='outline'
              disabled={loading}
              className='text-foreground bg-background hover:bg-muted h-10 shrink-0 cursor-pointer gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold'
              onClick={() => router.push(ROUTES.ADMIN.MODULES.BLOG_POSTS.LIST)}
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
                  ? 'Saving…'
                  : 'Creating...'
                : isEdit
                  ? 'Save Changes'
                  : 'Create Blog Post'}
            </Button>
          </div>
        </div>
      </section>
    </form>
  );
}

export default function BlogPostForm(props: Props) {
  if (props.mode === 'edit') {
    return <BlogPostEditFormLoader postId={props.postId} />;
  }
  return <BlogPostFormFields mode='create' />;
}
