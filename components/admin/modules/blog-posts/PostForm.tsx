'use client';

import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { NewspaperIcon, SaveIcon } from 'lucide-react';
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

type ComparableBlogPostState = {
  status: string;
  blog_category_id: number | null;
  thumbnail_url: string | null;
  has_existing_thumbnail: boolean;
  has_new_thumbnail: boolean;
  translations: Array<{
    locale: string;
    title: string;
    excerpt: string;
    content: string;
  }>;
};

function normalizeRichTextValue(value: string): string {
  const plainText = value
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();
  return plainText.length === 0 ? '' : value;
}

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

function buildComparableBlogPostState(args: {
  status: unknown;
  blogCategoryId: unknown;
  thumbnailUrl: unknown;
  existingThumbnailCount: number;
  hasNewThumbnail: boolean;
  translations: BlogPostTranslationInput[];
}): ComparableBlogPostState {
  return {
    status: String(args.status ?? 'draft'),
    blog_category_id:
      typeof args.blogCategoryId === 'number' ? args.blogCategoryId : null,
    thumbnail_url:
      typeof args.thumbnailUrl === 'string' && args.thumbnailUrl.trim()
        ? args.thumbnailUrl.trim()
        : null,
    has_existing_thumbnail: args.existingThumbnailCount > 0,
    has_new_thumbnail: args.hasNewThumbnail,
    translations: args.translations.map((translation) => ({
      locale: translation.locale,
      title: (translation.title ?? '').trim(),
      excerpt: (translation.excerpt ?? '').trim(),
      content: normalizeRichTextValue(translation.content ?? '').trim(),
    })),
  };
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
    const normalizedValue =
      field === 'content' ? normalizeRichTextValue(value) : value;
    const updated = translations.map((t) =>
      t.locale === locale ? { ...t, [field]: normalizedValue } : t,
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

  const hasLocaleFieldErrors = (locale: string) =>
    Boolean(
      getTranslationError(locale, 'title') ||
      getTranslationError(locale, 'content') ||
      getTranslationError(locale, 'excerpt'),
    );

  const submit = async () => {
    if (isEdit) {
      if (!form.isDirty) {
        toast.info('There are no changes to save.');
        return;
      }

      const initialComparable = buildComparableBlogPostState({
        status: enPost?.status ?? 'draft',
        blogCategoryId: enPost?.blog_category?.id ?? null,
        thumbnailUrl: enPost?.thumbnail ?? null,
        existingThumbnailCount: enPost?.thumbnail?.trim() ? 1 : 0,
        hasNewThumbnail: false,
        translations: buildTranslationsFromPosts(
          enPost as AdminBlogPost,
          myPost as AdminBlogPost,
        ),
      });
      const currentComparable = buildComparableBlogPostState({
        status: form.fields.status,
        blogCategoryId: form.fields.blog_category_id,
        thumbnailUrl: form.fields.thumbnail_url,
        existingThumbnailCount: existingThumbnail.length,
        hasNewThumbnail: form.fields.thumbnail instanceof File,
        translations,
      });

      if (JSON.stringify(initialComparable) === JSON.stringify(currentComparable)) {
        toast.info('There are no changes to save.');
        return;
      }
    }

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
          isEdit
            ? 'The blog post has been updated successfully.'
            : 'The blog post has been created successfully.',
        );
        router.push(ROUTES.ADMIN.MODULES.BLOG_POSTS.LIST);
      },
      onError: (error: ApiError) => {
        const errs = error.errors as FormErrors | undefined;
        if (!errs || Object.keys(errs).length === 0) return;
        const hasTranslationIssue = Object.keys(errs).some((k) =>
          k.startsWith('translations.'),
        );
        if (hasTranslationIssue) {
          setActiveLocale(firstLocaleTabForBlogPostErrors(errs));
        }
      },
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
  const isPublished = status === 'published';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      noValidate
    >
      <div className='grid min-w-0 gap-6 lg:grid-cols-3 lg:items-start'>
        <section className='border-border min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-5 lg:col-span-2'>
          <div className='space-y-6'>
            <div>
              <h3 className='text-foreground/90 text-sm font-semibold'>
                Post Content
              </h3>
              <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
                Provide the multilingual content for this post. Please enter a
                clear and engaging title, an informative excerpt, and the
                complete body text for each supported language.
              </p>
            </div>

            <div className='mt-5'>
              <Tabs
                value={activeLocale}
                onValueChange={(v) => setActiveLocale(v as 'en' | 'my')}
              >
                <TabsList
                  variant='line'
                  className='bg-muted! border-border mb-4 w-full border'
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

                  return (
                    <TabsContent
                      key={lang.code}
                      value={lang.code}
                      className='space-y-4'
                    >
                      <TextField
                        label='Title'
                        required
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
                        required
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

            <div className='border-border flex flex-nowrap items-center justify-end gap-2 border-t pt-5'>
              <Button
                type='button'
                variant='outline'
                disabled={loading}
                className='text-foreground bg-background hover:bg-muted h-10 shrink-0 cursor-pointer gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
                onClick={() =>
                  router.push(ROUTES.ADMIN.MODULES.BLOG_POSTS.LIST)
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
                  <NewspaperIcon className='size-3.5' />
                )}
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

        <section className='border-border min-w-0 rounded-md border bg-white p-4 shadow-xs sm:p-5 lg:col-span-1'>
          <div className='space-y-5'>
            <div>
              <h3 className='text-foreground/90 text-sm font-semibold'>
                Post Settings
              </h3>
              <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
                Configure the visibility, category, and featured image settings
                for this blog post.
              </p>
            </div>

            <div className='border-border space-y-2 border-t pt-4'>
              <FileUploadField
                label='Thumbnail'
                accept='image/*'
                required
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

            <div className='border-border border-t pt-4'>
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
            </div>

            <div className='border-border border-t pt-4'>
              <div className='bg-muted/30 border-border space-y-1 rounded-md border p-3.5'>
                <div className='flex items-center justify-between gap-3'>
                  <Label
                    htmlFor='blog-post-published'
                    className='text-foreground text-[13px] font-semibold'
                  >
                    Publication Status
                  </Label>
                  {isEdit ? (
                    <span className='text-muted-foreground text-[10px] font-bold uppercase'>
                      {isArchived ? 'Archived' : 'Published'}
                    </span>
                  ) : (
                    <Switch
                      id='blog-post-published'
                      className='h-5 w-9 shrink-0 **:data-[slot=switch-thumb]:size-4 **:data-[slot=switch-thumb]:data-[state=checked]:translate-x-4'
                      checked={isPublished}
                      onCheckedChange={(checked) =>
                        form.setData('status', checked ? 'published' : 'draft')
                      }
                    />
                  )}
                </div>
                <p className='text-muted-foreground text-[12px] leading-relaxed font-medium'>
                  {isPublished
                    ? 'This post is published and visible to all visitors.'
                    : isArchived
                      ? 'This post is archived and no longer accessible to visitors.'
                      : 'This post is in draft status and not visible to visitors.'}
                </p>
                {isEdit ? (
                  <div className='pt-1'>
                    <Button
                      type='button'
                      variant='outline'
                      disabled={loading}
                      className='text-foreground bg-background hover:bg-muted h-9 shrink-0 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold'
                      onClick={() =>
                        form.setData(
                          'status',
                          isArchived ? 'published' : 'archived',
                        )
                      }
                    >
                      {isArchived ? 'Move to Published' : 'Move to Archived'}
                    </Button>
                  </div>
                ) : null}
              </div>
              {form.errors.status ? (
                <p className='text-destructive text-xs font-medium'>
                  {form.errors.status}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}

export default function BlogPostForm(props: Props) {
  if (props.mode === 'edit') {
    return <BlogPostEditFormLoader postId={props.postId} />;
  }
  return <BlogPostFormFields mode='create' />;
}
