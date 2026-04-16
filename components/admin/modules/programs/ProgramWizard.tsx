'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  CircleIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import type { ComboboxOption } from '@/components/shared/form/ComboBoxField';
import ComboboxField from '@/components/shared/form/ComboBoxField';
import FileUploadField, {
  type FileUploadFieldRemoteFile,
} from '@/components/shared/form/FileUploadField';
import RichTextField from '@/components/shared/form/RichTextField';
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
  createProgramDraft,
  publishProgram,
  saveProgramOverview,
  saveProgramTranslations,
} from '@/domains/programs/services';
import type { AdminProgram, ProgramTranslation } from '@/domains/programs/types';
import { http } from '@/lib/api/client';

import StringListField from './StringListField';

// ─── Types ────────────────────────────────────────────────────────────────────

type TranslationData = {
  locale: 'en' | 'my';
  title: string;
  tagline: string;
  excerpt: string;
  about: string;
  features: string[];
  ideals: string[];
  expectations: string[];
  structures: string[];
};

type GoalLookup = { id: number; name: string; slug: string };

type FieldErrors = Record<string, string>;

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Thumbnail, duration, price, and program goals.',
  },
  {
    id: 'content',
    label: 'Content',
    description: 'Title, tagline, excerpt, and about — in each language.',
  },
  {
    id: 'details',
    label: 'Details',
    description: 'Features, ideals, expectations, and structure — in each language.',
  },
  {
    id: 'review',
    label: 'Review',
    description: 'Confirm and save the program.',
  },
] as const;

// ─── Step validation schemas ───────────────────────────────────────────────────

const step0Schema = z.object({
  duration: z
    .string()
    .min(1, 'Duration is required.')
    .max(10, 'Duration must be at most 10 characters.'),
  price: z.number().int().nonnegative('Price must be zero or greater.'),
});

const enContentSchema = z.object({
  title: z.string().min(1, 'English title is required.').max(255),
  tagline: z.string().min(1, 'English tagline is required.').max(255),
  excerpt: z.string().min(1, 'English excerpt is required.'),
  about: z.string().min(1, 'English about is required.'),
});

const enDetailsSchema = z.object({
  features: z.array(z.string()).min(1, 'Add at least one feature.'),
  ideals: z.array(z.string()).min(1, 'Add at least one ideal.'),
  expectations: z.array(z.string()).min(1, 'Add at least one expectation.'),
  structures: z.array(z.string()).min(1, 'Add at least one structure.'),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isMyTranslationStarted(t: TranslationData): boolean {
  return (
    t.title.trim() !== '' ||
    t.tagline.trim() !== '' ||
    t.excerpt.trim() !== '' ||
    t.about.trim() !== '' ||
    t.features.length > 0 ||
    t.ideals.length > 0 ||
    t.expectations.length > 0 ||
    t.structures.length > 0
  );
}

function isMyTranslationComplete(t: TranslationData): boolean {
  return (
    t.title.trim() !== '' &&
    t.tagline.trim() !== '' &&
    t.excerpt.trim() !== '' &&
    t.about.trim() !== '' &&
    t.features.length > 0 &&
    t.ideals.length > 0 &&
    t.expectations.length > 0 &&
    t.structures.length > 0
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export type ProgramWizardProps = {
  mode: 'create' | 'edit';
  program?: AdminProgram;
  enTranslation?: ProgramTranslation;
  myTranslation?: ProgramTranslation;
};

export default function ProgramWizard({
  mode,
  program,
  enTranslation,
  myTranslation,
}: ProgramWizardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = mode === 'edit';

  const [step, setStep] = React.useState(0);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [apiError, setApiError] = React.useState<string | null>(null);

  // ── Overview fields ─────────────────────────────────────────────────────────
  const [duration, setDuration] = React.useState(program?.duration ?? '');
  const [price, setPrice] = React.useState(program?.price?.amount ?? 0);
  const [goalIds, setGoalIds] = React.useState<number[]>(
    () => program?.goals?.map((g) => Number(g.id)) ?? [],
  );
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null);
  const [existingThumbnail, setExistingThumbnail] = React.useState<
    FileUploadFieldRemoteFile[]
  >(() => {
    if (!program?.thumbnail_url) return [];
    const url = program.thumbnail_url.startsWith('http')
      ? program.thumbnail_url
      : `${base.domainEndpoint}${program.thumbnail_url}`;
    return [{ url, name: url.split('/').pop() ?? 'thumbnail' }];
  });

  // ── Translation fields ──────────────────────────────────────────────────────
  const [translations, setTranslations] = React.useState<TranslationData[]>(
    () =>
      LANGUAGES.map((lang) => {
        const src = lang.code === 'en' ? enTranslation : myTranslation;
        return {
          locale: lang.code,
          title: src?.title ?? '',
          tagline: src?.tagline ?? '',
          excerpt: src?.excerpt ?? '',
          about: src?.about ?? '',
          features: src?.features ?? [],
          ideals: src?.ideals ?? [],
          expectations: src?.expectations ?? [],
          structures: src?.structures ?? [],
        };
      }),
  );

  // ── Goals lookup ────────────────────────────────────────────────────────────
  const { data: goalsData } = useQuery({
    queryKey: ['lookup', LOOKUP_ENDPOINTS.GOALS],
    queryFn: async () => {
      const res = await http.get<GoalLookup[]>(LOOKUP_ENDPOINTS.GOALS);
      return res.status === 'success' ? res.data : [];
    },
  });

  const goalOptions = React.useMemo<ComboboxOption[]>(
    () =>
      (goalsData ?? []).map((g) => ({
        value: String(g.id),
        label: g.name,
      })),
    [goalsData],
  );

  // ── Translation helpers ─────────────────────────────────────────────────────

  const updateTranslation = (
    locale: string,
    field: keyof Omit<TranslationData, 'locale'>,
    value: TranslationData[typeof field],
  ) => {
    setTranslations((prev) =>
      prev.map((t) => (t.locale === locale ? { ...t, [field]: value } : t)),
    );
    const key = `translations.${locale}.${field}`;
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const getTranslationError = (
    locale: string,
    field: keyof Omit<TranslationData, 'locale'>,
  ): string | undefined => errors[`translations.${locale}.${field}`];

  const isTranslationEmpty = (locale: string): boolean => {
    const t = translations.find((tr) => tr.locale === locale);
    return !t?.title?.trim();
  };

  // ── Per-step validation ─────────────────────────────────────────────────────

  const validateStep = (stepIndex: number): boolean => {
    if (stepIndex === 0) {
      const result = step0Schema.safeParse({ duration, price });
      if (!result.success) {
        const errs: FieldErrors = {};
        for (const issue of result.error.issues) {
          const key = String(issue.path[0]);
          if (!errs[key]) errs[key] = issue.message;
        }
        setErrors(errs);
        return false;
      }
      setErrors({});
      return true;
    }

    if (stepIndex === 1) {
      const en = translations.find((t) => t.locale === 'en');
      const result = enContentSchema.safeParse({
        title: en?.title ?? '',
        tagline: en?.tagline ?? '',
        excerpt: en?.excerpt ?? '',
        about: en?.about ?? '',
      });
      if (!result.success) {
        const errs: FieldErrors = {};
        for (const issue of result.error.issues) {
          errs[`translations.en.${String(issue.path[0])}`] = issue.message;
        }
        setErrors(errs);
        return false;
      }
      setErrors({});
      return true;
    }

    if (stepIndex === 2) {
      const en = translations.find((t) => t.locale === 'en');
      const result = enDetailsSchema.safeParse({
        features: en?.features ?? [],
        ideals: en?.ideals ?? [],
        expectations: en?.expectations ?? [],
        structures: en?.structures ?? [],
      });
      if (!result.success) {
        const errs: FieldErrors = {};
        for (const issue of result.error.issues) {
          errs[`translations.en.${String(issue.path[0])}`] = issue.message;
        }
        setErrors(errs);
        return false;
      }
      setErrors({});
      return true;
    }

    setErrors({});
    return true;
  };

  // ── Mutation ────────────────────────────────────────────────────────────────

  const mutation = useMutation({
    mutationFn: async ({ shouldPublish }: { shouldPublish: boolean }) => {
      const myT = translations.find((t) => t.locale === 'my');
      const includesMy = myT ? isMyTranslationStarted(myT) : false;

      if (includesMy && !isMyTranslationComplete(myT!)) {
        throw new Error(
          'Myanmar translation is partially filled. Complete all fields or clear it entirely.',
        );
      }

      const translationPayload = translations
        .filter((t) => t.locale === 'en' || (t.locale === 'my' && includesMy))
        .map((t) => ({
          locale: t.locale,
          title: t.title,
          tagline: t.tagline,
          excerpt: t.excerpt,
          about: t.about,
          features: t.features.filter(Boolean),
          ideals: t.ideals.filter(Boolean),
          expectations: t.expectations.filter(Boolean),
          structures: t.structures.filter(Boolean),
        }));

      let programId = program?.id;

      // 1. Create draft if in create mode
      if (!isEdit) {
        const draftRes = await createProgramDraft();
        if (draftRes.status === 'error') {
          throw new Error(draftRes.message ?? 'Failed to create program draft.');
        }
        programId = draftRes.data.id;
      }

      if (!programId) throw new Error('No program ID.');

      // 2. Save overview step
      const overviewRes = await saveProgramOverview(
        programId,
        { duration, price, goal_ids: goalIds.length ? goalIds : undefined },
        thumbnailFile,
      );
      if (overviewRes.status === 'error') {
        throw new Error(overviewRes.message ?? 'Failed to save overview.');
      }

      // 3. Save translations step
      const transRes = await saveProgramTranslations(programId, translationPayload);
      if (transRes.status === 'error') {
        throw new Error(transRes.message ?? 'Failed to save translations.');
      }

      // 4. Optionally publish
      if (shouldPublish) {
        const pubRes = await publishProgram(programId);
        if (pubRes.status === 'error') {
          throw new Error(pubRes.message ?? 'Failed to publish program.');
        }
      }

      return { programId };
    },
    onSuccess: (_, { shouldPublish }) => {
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.PROGRAMS.LIST],
      });
      toast.success(
        shouldPublish
          ? 'Program published.'
          : isEdit
            ? 'Program updated.'
            : 'Program created.',
      );
      router.push(ROUTES.ADMIN.MODULES.PROGRAMS.LIST);
    },
    onError: (error: Error) => {
      setApiError(error.message);
      toast.error(error.message);
    },
  });

  // ── Navigation ──────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (!validateStep(step)) return;
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((prev) => prev - 1);
  };

  const handleStepClick = (targetIndex: number) => {
    if (targetIndex <= step) {
      setErrors({});
      setStep(targetIndex);
      return;
    }
    for (let i = step; i < targetIndex; i++) {
      if (!validateStep(i)) return;
    }
    setStep(targetIndex);
  };

  const isLastStep = step === STEPS.length - 1;
  const isSubmitting = mutation.isPending;
  const currentStep = STEPS[step];

  // ── Step content ────────────────────────────────────────────────────────────

  const renderStepContent = () => {
    switch (step) {
      // ── Step 0: Overview ───────────────────────────────────────────────────
      case 0:
        return (
          <div className='space-y-5'>
            <FileUploadField
              label='Thumbnail'
              accept='image/*'
              maxFileSize={5 * 1024 * 1024}
              existingFiles={existingThumbnail}
              onExistingFilesChange={(files) => {
                setExistingThumbnail(files);
                if (files.length === 0) setThumbnailFile(null);
              }}
              onFilesChange={(files) => setThumbnailFile(files[0] ?? null)}
              emptyHint='Click or drag image here (PNG, JPG, JPEG — max 5 MB)'
              error={errors.thumbnail}
            />

            <div className='border-border/40 border-t pt-5'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <TextField
                  label='Duration'
                  required
                  placeholder='e.g. 8 weeks (max 10 chars)'
                  value={duration}
                  onChange={(e) => {
                    setDuration(e.target.value);
                    setErrors((prev) => { const n = { ...prev }; delete n.duration; return n; });
                  }}
                  error={errors.duration}
                />
                <TextField
                  label='Price (MMK)'
                  required
                  type='number'
                  placeholder='0'
                  value={String(price)}
                  onChange={(e) => {
                    setPrice(Number(e.target.value));
                    setErrors((prev) => { const n = { ...prev }; delete n.price; return n; });
                  }}
                  error={errors.price}
                />
              </div>
            </div>

            <ComboboxField
              label='Goals'
              multiple
              placeholder='Select program goals…'
              searchPlaceholder='Search goals…'
              emptyMessage='No goals found.'
              options={goalOptions}
              value={goalIds.map((id) => String(id))}
              onChange={(vals) => setGoalIds((vals ?? []).map((v) => Number(v)))}
            />
          </div>
        );

      // ── Step 1: Content (EN/MY tabs) ───────────────────────────────────────
      case 1:
        return (
          <Tabs defaultValue='en'>
            <TabsList className='mb-5 h-9 w-full justify-start rounded-lg p-1'>
              {LANGUAGES.map((lang) => {
                const isEmpty = isTranslationEmpty(lang.code);
                const hasError =
                  !!getTranslationError(lang.code, 'title') ||
                  !!getTranslationError(lang.code, 'tagline') ||
                  !!getTranslationError(lang.code, 'excerpt') ||
                  !!getTranslationError(lang.code, 'about');
                return (
                  <TabsTrigger
                    key={lang.code}
                    value={lang.code}
                    className='relative cursor-pointer gap-1.5 text-xs'
                  >
                    {lang.name}
                    {isEmpty && lang.code !== 'en' && !hasError && (
                      <span className='size-1.5 rounded-full bg-amber-400' />
                    )}
                    {hasError && (
                      <span className='bg-destructive size-1.5 rounded-full' />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {LANGUAGES.map((lang) => {
              const t = translations.find((tr) => tr.locale === lang.code);
              return (
                <TabsContent key={lang.code} value={lang.code} className='space-y-5'>
                  {lang.code === 'my' && isTranslationEmpty('my') && (
                    <div className='flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400'>
                      <AlertTriangleIcon className='mt-0.5 size-3.5 shrink-0' />
                      <span>
                        Myanmar translation is optional. If you fill any field,
                        all fields become required.
                      </span>
                    </div>
                  )}

                  <TextField
                    label='Title'
                    required={lang.code === 'en'}
                    placeholder={
                      lang.code === 'en'
                        ? 'e.g. Weight Loss & Wellness'
                        : 'ကျန်းမာရေး ပရိုဂရမ်…'
                    }
                    value={t?.title ?? ''}
                    onChange={(e) => updateTranslation(lang.code, 'title', e.target.value)}
                    error={getTranslationError(lang.code, 'title')}
                  />

                  <TextField
                    label='Tagline'
                    required={lang.code === 'en'}
                    placeholder={
                      lang.code === 'en'
                        ? 'A short motivational phrase…'
                        : 'ကျန်းမာသောဘဝ…'
                    }
                    value={t?.tagline ?? ''}
                    onChange={(e) => updateTranslation(lang.code, 'tagline', e.target.value)}
                    error={getTranslationError(lang.code, 'tagline')}
                  />

                  <TextAreaField
                    label='Excerpt'
                    required={lang.code === 'en'}
                    placeholder={
                      lang.code === 'en'
                        ? 'A brief summary shown in listings…'
                        : 'ပရိုဂရမ်အကြောင်း အကျဉ်းချုပ်…'
                    }
                    rows={4}
                    value={t?.excerpt ?? ''}
                    onChange={(e) => updateTranslation(lang.code, 'excerpt', e.target.value)}
                    error={getTranslationError(lang.code, 'excerpt')}
                  />

                  <RichTextField
                    label='About'
                    required={lang.code === 'en'}
                    description={
                      lang.code === 'en'
                        ? 'Full description shown on the detail page.'
                        : 'Full description in Myanmar.'
                    }
                    value={t?.about ?? ''}
                    onChange={(val) => updateTranslation(lang.code, 'about', val)}
                    error={getTranslationError(lang.code, 'about')}
                  />
                </TabsContent>
              );
            })}
          </Tabs>
        );

      // ── Step 2: Details (EN/MY tabs) ───────────────────────────────────────
      case 2:
        return (
          <Tabs defaultValue='en'>
            <TabsList className='mb-5 h-9 w-full justify-start rounded-lg p-1'>
              {LANGUAGES.map((lang) => {
                const t = translations.find((tr) => tr.locale === lang.code);
                const hasContent =
                  (t?.features.length ?? 0) > 0 ||
                  (t?.ideals.length ?? 0) > 0 ||
                  (t?.expectations.length ?? 0) > 0 ||
                  (t?.structures.length ?? 0) > 0;
                const hasError =
                  !!getTranslationError(lang.code, 'features') ||
                  !!getTranslationError(lang.code, 'ideals') ||
                  !!getTranslationError(lang.code, 'expectations') ||
                  !!getTranslationError(lang.code, 'structures');
                return (
                  <TabsTrigger
                    key={lang.code}
                    value={lang.code}
                    className='relative cursor-pointer gap-1.5 text-xs'
                  >
                    {lang.name}
                    {!hasContent && lang.code !== 'en' && !hasError && (
                      <span className='size-1.5 rounded-full bg-amber-400' />
                    )}
                    {hasError && (
                      <span className='bg-destructive size-1.5 rounded-full' />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {LANGUAGES.map((lang) => {
              const t = translations.find((tr) => tr.locale === lang.code);
              return (
                <TabsContent key={lang.code} value={lang.code} className='space-y-5'>
                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <StringListField
                      label={lang.code === 'en' ? 'Features *' : 'Features'}
                      description={lang.code === 'en' ? 'What this program offers.' : undefined}
                      value={t?.features ?? []}
                      onChange={(val) => updateTranslation(lang.code, 'features', val)}
                      placeholder={lang.code === 'en' ? 'Add a feature…' : 'Feature ထည့်ရန်…'}
                      error={getTranslationError(lang.code, 'features')}
                    />
                    <StringListField
                      label={lang.code === 'en' ? 'Ideals *' : 'Ideals'}
                      description={lang.code === 'en' ? 'Who this program is ideal for.' : undefined}
                      value={t?.ideals ?? []}
                      onChange={(val) => updateTranslation(lang.code, 'ideals', val)}
                      placeholder={lang.code === 'en' ? 'Add an ideal…' : 'Ideal ထည့်ရန်…'}
                      error={getTranslationError(lang.code, 'ideals')}
                    />
                    <StringListField
                      label={lang.code === 'en' ? 'Expectations *' : 'Expectations'}
                      description={lang.code === 'en' ? 'What clients can expect.' : undefined}
                      value={t?.expectations ?? []}
                      onChange={(val) => updateTranslation(lang.code, 'expectations', val)}
                      placeholder={lang.code === 'en' ? 'Add an expectation…' : 'မျှော်မှန်းချက် ထည့်ရန်…'}
                      error={getTranslationError(lang.code, 'expectations')}
                    />
                    <StringListField
                      label={lang.code === 'en' ? 'Structure *' : 'Structure'}
                      description={lang.code === 'en' ? 'How the program is organized.' : undefined}
                      value={t?.structures ?? []}
                      onChange={(val) => updateTranslation(lang.code, 'structures', val)}
                      placeholder={lang.code === 'en' ? 'Add a structure item…' : 'ဖွဲ့စည်းပုံ ထည့်ရန်…'}
                      error={getTranslationError(lang.code, 'structures')}
                    />
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        );

      // ── Step 3: Review ─────────────────────────────────────────────────────
      case 3: {
        const enT = translations.find((t) => t.locale === 'en');
        const myT = translations.find((t) => t.locale === 'my');
        const myStarted = myT ? isMyTranslationStarted(myT) : false;
        const myComplete = myT ? isMyTranslationComplete(myT) : false;

        const overviewReady = !!(
          (thumbnailFile || existingThumbnail.length > 0) &&
          duration.trim() &&
          goalIds.length > 0
        );
        const translationsReady = !!(
          enT?.title &&
          enT?.tagline &&
          enT?.excerpt &&
          enT?.about &&
          (enT?.features.length ?? 0) > 0 &&
          (enT?.ideals.length ?? 0) > 0 &&
          (enT?.expectations.length ?? 0) > 0 &&
          (enT?.structures.length ?? 0) > 0
        );
        const canPublish = overviewReady && translationsReady && (!myStarted || myComplete);

        const CheckRow = ({
          label,
          ok,
          note,
        }: {
          label: string;
          ok: boolean;
          note?: string;
        }) => (
          <div className='flex items-start gap-2 text-sm'>
            {ok ? (
              <CheckCircle2Icon className='mt-0.5 size-4 shrink-0 text-emerald-500' />
            ) : (
              <CircleIcon className='text-muted-foreground mt-0.5 size-4 shrink-0' />
            )}
            <div>
              <span className={ok ? 'text-foreground' : 'text-muted-foreground'}>
                {label}
              </span>
              {note && (
                <p className='text-muted-foreground mt-0.5 text-xs'>{note}</p>
              )}
            </div>
          </div>
        );

        return (
          <div className='space-y-6'>
            <div className='bg-muted/30 border-border/50 space-y-3 rounded-lg border p-4'>
              <p className='text-sm font-semibold'>Step completion</p>
              <div className='space-y-2'>
                <CheckRow
                  label='Overview'
                  ok={overviewReady}
                  note={
                    !overviewReady
                      ? 'Thumbnail, duration, and at least one goal are required to publish.'
                      : undefined
                  }
                />
                <CheckRow
                  label='English translation'
                  ok={translationsReady}
                  note={
                    !translationsReady
                      ? 'All content fields and list items are required.'
                      : undefined
                  }
                />
                <CheckRow
                  label='Myanmar translation'
                  ok={myComplete}
                  note={
                    myStarted && !myComplete
                      ? 'Partially filled — complete all fields or clear them.'
                      : !myStarted
                        ? 'Optional.'
                        : undefined
                  }
                />
              </div>
            </div>

            {myStarted && !myComplete && (
              <div className='flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400'>
                <AlertTriangleIcon className='mt-0.5 size-3.5 shrink-0' />
                <span>
                  Myanmar translation is partially filled. You must either
                  complete all fields or clear them before saving.
                </span>
              </div>
            )}

            {apiError && (
              <p className='text-destructive text-sm' role='alert'>
                {apiError}
              </p>
            )}

            <div className='flex flex-col gap-2'>
              <Button
                type='button'
                disabled={isSubmitting}
                onClick={() => {
                  setApiError(null);
                  mutation.mutate({ shouldPublish: false });
                }}
                variant='outline'
                className='w-full'
              >
                {isSubmitting ? (isEdit ? 'Saving…' : 'Creating…') : isEdit ? 'Save as Draft' : 'Save Program'}
              </Button>

              {canPublish && (
                <Button
                  type='button'
                  disabled={isSubmitting}
                  onClick={() => {
                    setApiError(null);
                    mutation.mutate({ shouldPublish: true });
                  }}
                  className='w-full'
                >
                  <CheckCircle2Icon className='size-4' />
                  {isSubmitting ? 'Publishing…' : 'Save & Publish'}
                </Button>
              )}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Card className='border-border/70 shadow-sm'>
      {/* Step indicator */}
      <CardHeader className='bg-muted/25 border-border space-y-4 border-b pb-5'>
        <div>
          <CardTitle className='text-base md:text-lg'>
            {currentStep.label}
          </CardTitle>
          <CardDescription className='mt-0.5'>
            {currentStep.description}
          </CardDescription>
        </div>

        <div className='flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
          {STEPS.map((s, index) => {
            const isActive = index === step;
            const isPassed = index < step;
            return (
              <button
                key={s.id}
                type='button'
                onClick={() => handleStepClick(index)}
                className={`group flex min-w-fit items-center gap-2 rounded-md border px-3 py-2 text-xs transition md:text-sm ${
                  isActive
                    ? 'bg-primary/10 border-primary text-primary'
                    : isPassed
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                      : 'bg-background hover:bg-muted border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <span
                  className={`inline-flex size-5 items-center justify-center rounded-full border text-[10px] font-semibold ${
                    isActive
                      ? 'border-primary bg-primary text-white'
                      : isPassed
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-border bg-muted text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </span>
                <span className='whitespace-nowrap font-medium'>{s.label}</span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className='space-y-6 p-4 md:p-6'>
        <div>{renderStepContent()}</div>

        {/* Navigation — hidden on last step (buttons are inside step content) */}
        {!isLastStep && (
          <div className='border-border flex items-center justify-between border-t pt-4'>
            <Button
              type='button'
              variant='outline'
              disabled={step === 0}
              onClick={handleBack}
              className='min-w-24'
            >
              <ArrowLeftIcon className='size-4' />
              Back
            </Button>

            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='text-muted-foreground hidden md:flex'
                onClick={() => router.push(ROUTES.ADMIN.MODULES.PROGRAMS.LIST)}
              >
                Cancel
              </Button>

              <Button type='button' onClick={handleNext} className='min-w-24'>
                Next
                <ChevronRightIcon className='size-4' />
              </Button>
            </div>
          </div>
        )}

        {/* Back button on last step */}
        {isLastStep && (
          <div className='border-border flex items-center justify-between border-t pt-4'>
            <Button
              type='button'
              variant='outline'
              disabled={isSubmitting}
              onClick={handleBack}
              className='min-w-24'
            >
              <ArrowLeftIcon className='size-4' />
              Back
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='text-muted-foreground'
              onClick={() => router.push(ROUTES.ADMIN.MODULES.PROGRAMS.LIST)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
