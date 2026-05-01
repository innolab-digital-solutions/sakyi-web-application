'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  PhoneCallIcon,
  SaveIcon,
  XCircleIcon,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';

import { AdminWorkspaceSkeleton } from '@/components/admin/layout/AdminLoadingSkeletons';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ENDPOINTS } from '@/config/api/endpoints';
import { ROUTES } from '@/config/routes';
import { trackOnboardingEvent } from '@/domains/intake-assessments/analytics';
import {
  buildSaveSectionPayload,
  type DraftBySection,
  findResumeSectionId,
  getRequiredFieldErrorsForSection,
  hydrateDraftAnswersFromSections,
  mapSectionFieldErrorsFromApi,
  saveSectionPayloadFingerprint,
  type SectionDraftAnswers,
} from '@/domains/intake-assessments/mappers/admin';
import { OnboardingCancelIntakeSchema } from '@/domains/intake-assessments/schemas';
import {
  cancelOnboardingIntake,
  completeOnboardingIntake,
  getOnboardingIntakeById,
  saveOnboardingIntakeSection,
} from '@/domains/intake-assessments/services';
import type {
  OnboardingIntakeResponse,
  OnboardingIntakeSection,
} from '@/domains/intake-assessments/types';
import { useForm } from '@/lib/form';
import type { ApiError } from '@/types/api';

import IntakeCancelConfirmation from './IntakeCancelConfirmation';
import OnboardingCompleteConfirmation from './OnboardingCompleteConfirmation';
import OnboardingQuestionField from './OnboardingQuestionField';

/** Bump `v1` if guidance copy changes enough to warrant showing the banner again. */
const ONBOARDING_INTAKE_GUIDANCE_DISMISSED_STORAGE_KEY =
  'sakyi:admin:onboarding-intake:guidance-dismissed:v1';

type OnboardingWizardProps = {
  intakeId: number;
};

type SaveSectionMutationInput = {
  section: OnboardingIntakeSection;
  /** Draft used for the request and for post-save fingerprinting (avoid stale closures). */
  draftSnapshot: SectionDraftAnswers;
  silentSuccessToast?: boolean;
};

export default function OnboardingWizard({ intakeId }: OnboardingWizardProps) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [_sectionErrors, setSectionErrors] = useState<Record<number, string>>(
    {},
  );
  const [fieldErrorsBySection, setFieldErrorsBySection] = useState<
    Record<number, Record<number, string>>
  >({});
  const [draftOverrides, setDraftOverrides] = useState<DraftBySection>({});
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    null,
  );
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [completeConfirmationOpen, setCompleteConfirmationOpen] =
    useState(false);
  const [intakeGuidanceDismissed, setIntakeGuidanceDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return (
        window.localStorage.getItem(
          ONBOARDING_INTAKE_GUIDANCE_DISMISSED_STORAGE_KEY,
        ) === '1'
      );
    } catch {
      return false;
    }
  });

  const dismissIntakeGuidancePermanently = useCallback(() => {
    try {
      window.localStorage.setItem(
        ONBOARDING_INTAKE_GUIDANCE_DISMISSED_STORAGE_KEY,
        '1',
      );
    } catch {
      /* storage unavailable (private mode, quota, etc.) */
    }
    setIntakeGuidanceDismissed(true);
  }, []);

  const hasRedirectedOnReadonly = useRef(false);
  const wizardSectionRef = useRef<HTMLElement | null>(null);
  const persistedSectionSaveFingerprintRef = useRef<Record<number, string>>({});
  const persistedFingerprintIntakeIdRef = useRef(intakeId);
  const previousActiveSectionIdRef = useRef<number | null>(null);
  /** Prevents overlapping forward navigation (e.g. double tab clicks) from firing multiple saves. */
  const forwardNavigationLockRef = useRef(false);

  const cancelForm = useForm(
    { cancellation_note: '' },
    { schema: OnboardingCancelIntakeSchema },
  );
  const saveForm = useForm({ answers: [] as unknown[] });

  const intakeQuery = useQuery({
    queryKey: ['onboarding', 'intake', intakeId],
    queryFn: () => getOnboardingIntakeById(intakeId),
  });

  const successIntake = useMemo<OnboardingIntakeResponse | null>(() => {
    if (intakeQuery.data?.status !== 'success') return null;
    return intakeQuery.data as OnboardingIntakeResponse;
  }, [intakeQuery.data]);

  const sections = useMemo(() => {
    if (!successIntake) return [] as OnboardingIntakeSection[];
    const rawSections = successIntake.data.template?.sections ?? [];
    return [...rawSections].sort(
      (left, right) => left.sort_order - right.sort_order,
    );
  }, [successIntake]);

  const status = successIntake?.data.status ?? null;
  const isReadonly = status === 'completed' || status === 'cancelled';

  const hydratedDraftBySection = useMemo(
    () => hydrateDraftAnswersFromSections(sections),
    [sections],
  );

  const draftBySection = useMemo(() => {
    return Object.entries(hydratedDraftBySection).reduce<DraftBySection>(
      (draft, [sectionIdKey, sectionAnswers]) => {
        const sectionId = Number.parseInt(sectionIdKey, 10);
        draft[sectionId] = {
          ...sectionAnswers,
          ...(draftOverrides[sectionId] ?? {}),
        };
        return draft;
      },
      {},
    );
  }, [draftOverrides, hydratedDraftBySection]);

  useLayoutEffect(() => {
    if (persistedFingerprintIntakeIdRef.current !== intakeId) {
      persistedSectionSaveFingerprintRef.current = {};
      persistedFingerprintIntakeIdRef.current = intakeId;
    }
    if (!sections.length) return;
    const ref = persistedSectionSaveFingerprintRef.current;
    for (const section of sections) {
      if (ref[section.id] !== undefined) continue;
      const draft = hydratedDraftBySection[section.id] ?? {};
      ref[section.id] = saveSectionPayloadFingerprint(section, draft);
    }
  }, [hydratedDraftBySection, intakeId, sections]);

  const isSectionDraftDirty = useCallback(
    (section: OnboardingIntakeSection, draft: SectionDraftAnswers) => {
      const current = saveSectionPayloadFingerprint(section, draft);
      const persisted = persistedSectionSaveFingerprintRef.current[section.id];
      if (persisted === undefined) return true;
      return current !== persisted;
    },
    [],
  );

  const activeSectionId = useMemo(() => {
    if (selectedSectionId != null) return selectedSectionId;
    if (!sections.length) return null;
    const stepParam = searchParams.get('step') ?? '';
    const fromQuery = Number.parseInt(stepParam, 10);
    if (
      Number.isInteger(fromQuery) &&
      sections.some((section) => section.id === fromQuery)
    ) {
      return fromQuery;
    }
    const resumeId = findResumeSectionId(sections, hydratedDraftBySection);
    return resumeId ?? sections[0].id;
  }, [hydratedDraftBySection, searchParams, sections, selectedSectionId]);

  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeSectionId) ?? null,
    [activeSectionId, sections],
  );

  const sectionIndex = useMemo(
    () => sections.findIndex((section) => section.id === activeSectionId),
    [activeSectionId, sections],
  );

  useEffect(() => {
    if (!isReadonly || hasRedirectedOnReadonly.current) return;
    hasRedirectedOnReadonly.current = true;
    router.replace(
      ROUTES.ADMIN.MODULES.INTAKE_ASSESSMENTS.DETAIL(String(intakeId)),
    );
  }, [intakeId, isReadonly, router]);

  const scrollToWizardTop = useCallback(() => {
    const root = wizardSectionRef.current;
    if (!root) return;
    root.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
  }, []);

  const scrollToFirstInvalidField = useCallback(() => {
    const root = wizardSectionRef.current;
    if (!root) return;

    requestAnimationFrame(() => {
      const invalidEl = root.querySelector<HTMLElement>(
        '[aria-invalid="true"]',
      );
      if (invalidEl) {
        invalidEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
        if (typeof invalidEl.focus === 'function') {
          invalidEl.focus({ preventScroll: true });
        }
      }
    });
  }, []);

  useEffect(() => {
    if (activeSectionId == null) return;
    const previous = previousActiveSectionIdRef.current;
    if (previous != null && previous !== activeSectionId) {
      scrollToWizardTop();
    }
    previousActiveSectionIdRef.current = activeSectionId;
  }, [activeSectionId, scrollToWizardTop]);

  const revalidateIntakeQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['onboarding', 'intake', intakeId],
      }),
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.INTAKE_ASSESSMENTS.LIST],
      }),
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: async ({
      section,
      draftSnapshot,
    }: SaveSectionMutationInput) => {
      const payload = buildSaveSectionPayload(section, draftSnapshot);
      saveForm.setData('answers', payload.answers);
      return saveOnboardingIntakeSection(intakeId, section.id, payload);
    },
    onSuccess: async (response, { section, silentSuccessToast }) => {
      if (response.status === 'error') {
        trackOnboardingEvent('onboarding_section_save_error', {
          intakeId,
          sectionId: section.id,
          message: response.message,
          status: response.status,
        });
        setSectionErrors((prev) => ({
          ...prev,
          [section.id]: response.message,
        }));
        setFieldErrorsBySection((prev) => ({
          ...prev,
          [section.id]: mapSectionFieldErrorsFromApi(response as ApiError),
        }));
        return;
      }

      setSectionErrors((prev) => ({ ...prev, [section.id]: '' }));
      setFieldErrorsBySection((prev) => ({ ...prev, [section.id]: {} }));
      trackOnboardingEvent('onboarding_section_save_success', {
        intakeId,
        sectionId: section.id,
        status: response.status,
      });

      await queryClient.refetchQueries({
        queryKey: ['onboarding', 'intake', intakeId],
      });

      setDraftOverrides((prev) => {
        if (!(section.id in prev)) return prev;
        const next = { ...prev };
        delete next[section.id];
        return next;
      });

      const cached = queryClient.getQueryData<OnboardingIntakeResponse>([
        'onboarding',
        'intake',
        intakeId,
      ]);
      if (cached?.status === 'success') {
        const freshSections = [...(cached.data.template?.sections ?? [])].sort(
          (a, b) => a.sort_order - b.sort_order,
        );
        const freshSection = freshSections.find((s) => s.id === section.id);
        if (freshSection) {
          const freshHydrated =
            hydrateDraftAnswersFromSections(freshSections)[section.id] ?? {};
          persistedSectionSaveFingerprintRef.current[section.id] =
            saveSectionPayloadFingerprint(freshSection, freshHydrated);
        }
      }

      void queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.INTAKE_ASSESSMENTS.LIST],
      });

      if (!silentSuccessToast) {
        toast.success('The section responses have been saved successfully.');
      }
    },
    onError: () => {
      toast.error('Network error while saving section. Try again.');
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => completeOnboardingIntake(intakeId),
    onSuccess: async (response) => {
      if (response.status === 'error') {
        trackOnboardingEvent('onboarding_complete_error', {
          intakeId,
          status: response.status,
          message: response.message,
        });
        toast.error(response.message);
        return;
      }
      trackOnboardingEvent('onboarding_complete_success', {
        intakeId,
        status: response.status,
      });
      await revalidateIntakeQueries();
      toast.success('The intake assessment completed successfully.');
      router.push(
        ROUTES.ADMIN.MODULES.INTAKE_ASSESSMENTS.DETAIL(String(intakeId)),
      );
    },
    onError: () => {
      toast.error('Network error while completing intake.');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => {
      const cancellation_note =
        typeof cancelForm.fields.cancellation_note === 'string'
          ? cancelForm.fields.cancellation_note.trim() || undefined
          : undefined;
      return cancelOnboardingIntake(intakeId, { cancellation_note });
    },
    onSuccess: async (response) => {
      if (response.status === 'error') {
        trackOnboardingEvent('onboarding_cancel_error', {
          intakeId,
          status: response.status,
          message: response.message,
        });
        toast.error(response.message);
        return;
      }
      trackOnboardingEvent('onboarding_cancel_success', {
        intakeId,
        status: response.status,
      });
      await revalidateIntakeQueries();
      setCancelDialogOpen(false);
      toast.success('The intake assessment cancelled successfully.');
      router.push(
        ROUTES.ADMIN.MODULES.INTAKE_ASSESSMENTS.DETAIL(String(intakeId)),
      );
    },
    onError: () => {
      toast.error('Network error while cancelling intake.');
    },
  });

  if (intakeQuery.isPending) {
    return <AdminWorkspaceSkeleton />;
  }

  if (intakeQuery.data?.status === 'error') {
    return (
      <p className='text-destructive text-sm'>{intakeQuery.data.message}</p>
    );
  }

  if (!sections.length || activeSection == null) {
    return (
      <p className='text-muted-foreground text-sm'>
        No template sections found.
      </p>
    );
  }

  const progress = successIntake?.meta?.progress;
  const intakeRecord = successIntake?.data;
  const activeFieldErrors = fieldErrorsBySection[activeSection.id] ?? {};
  const canGoBack = sectionIndex > 0;
  const canGoNext = sectionIndex >= 0 && sectionIndex < sections.length - 1;
  const isLastSection = !canGoNext;
  const isLastSectionFileGrid =
    isLastSection &&
    activeSection.questions.length > 0 &&
    activeSection.questions.every((question) => question.type === 'file');
  const completionRate = progress?.completion_rate ?? 0;

  const validateCurrentSectionRequired = (
    section: OnboardingIntakeSection,
  ): boolean => {
    const sectionDraft = draftBySection[section.id] ?? {};
    const nextErrors = getRequiredFieldErrorsForSection(section, sectionDraft);

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrorsBySection((prev) => ({
        ...prev,
        [section.id]: {
          ...(prev[section.id] ?? {}),
          ...nextErrors,
        },
      }));
      setSectionErrors((prev) => ({
        ...prev,
        [section.id]:
          'Please fill all required fields before moving to the next step.',
      }));
      scrollToFirstInvalidField();
      return false;
    }

    setFieldErrorsBySection((prev) => ({
      ...prev,
      [section.id]: {},
    }));
    setSectionErrors((prev) => ({
      ...prev,
      [section.id]: '',
    }));

    return true;
  };

  const handleQuestionValueChange = (
    sectionId: number,
    questionId: number,
    value: string | number | string[] | number[] | File | null,
  ) => {
    setDraftOverrides((prev) => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] ?? {}),
        [questionId]: value,
      },
    }));

    setFieldErrorsBySection((prev) => {
      const sectionFieldErrors = { ...(prev[sectionId] ?? {}) };
      if (!(questionId in sectionFieldErrors)) return prev;
      delete sectionFieldErrors[questionId];
      return {
        ...prev,
        [sectionId]: sectionFieldErrors,
      };
    });

    setSectionErrors((prev) => {
      if (!prev[sectionId]) return prev;
      return {
        ...prev,
        [sectionId]: '',
      };
    });
  };

  const handleStepClick = async (
    targetSection: OnboardingIntakeSection,
    targetIndex: number,
  ) => {
    // Always allow moving to current/previous steps.
    if (targetIndex <= sectionIndex) {
      setSelectedSectionId(targetSection.id);
      return;
    }

    if (forwardNavigationLockRef.current) return;
    forwardNavigationLockRef.current = true;
    try {
      const isValid = validateCurrentSectionRequired(activeSection);
      if (!isValid) return;

      const forwardDraft = draftBySection[activeSection.id] ?? {};
      if (isSectionDraftDirty(activeSection, forwardDraft)) {
        const response = await saveMutation.mutateAsync({
          section: activeSection,
          draftSnapshot: forwardDraft,
        });
        if (response.status === 'error') return;
      }
      setSelectedSectionId(targetSection.id);
    } finally {
      forwardNavigationLockRef.current = false;
    }
  };

  return (
    <section
      ref={wizardSectionRef}
      className='border-border max-w-full min-w-0 space-y-5 rounded-md border bg-white p-4 shadow-xs sm:p-5 lg:p-6'
    >
      <div className='border-border space-y-4 border-b pb-5'>
        {intakeRecord && (
          <div className='space-y-4'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div className='space-y-1.5'>
                <p className='text-muted-foreground text-[10px]! font-semibold tracking-wide uppercase'>
                  Intake Assessment Template
                </p>
                <h3 className='text-sm font-semibold tracking-normal'>
                  {intakeRecord.template?.title?.trim() || 'Unknown template'}{' '}
                  (v{intakeRecord.template?.version ?? '—'})
                </h3>
              </div>

              <div className='space-y-1.5 text-left md:text-right'>
                <p className='text-muted-foreground text-[10px]! font-semibold tracking-wide uppercase'>
                  Intake Assessment Reference
                </p>
                <p className='text-foreground/90 text-[13px] leading-relaxed font-semibold'>
                  {intakeRecord.code?.trim() || `#${intakeRecord.id}`}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className='grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-center'>
          <div className='space-y-2'>
            <div className='bg-muted h-2 overflow-hidden rounded-full'>
              <div
                className='bg-primary h-full transition-all'
                style={{
                  width: `${Math.max(0, Math.min(completionRate, 100))}%`,
                }}
              />
            </div>
            <div className='text-muted-foreground flex items-center justify-between text-[12px] font-semibold'>
              <span>
                Required Answered: {progress?.answered_required ?? 0}/
                {progress?.total_required ?? 0}
              </span>
              <span>{Math.round(completionRate)}%</span>
            </div>
          </div>
        </div>
      </div>
      <div className='space-y-5'>
        {isReadonly && (
          <div className='bg-muted border-border mb-4 rounded-md border p-3 text-sm'>
            <p className='font-medium'>Read only</p>
            <p className='text-muted-foreground'>
              This intake is {status}. Editing is disabled.
            </p>
          </div>
        )}

        <div className='space-y-4'>
          {!isReadonly && !intakeGuidanceDismissed ? (
            <div
              className='bg-background border-border flex items-start gap-3 rounded-md border p-3'
              role='region'
              aria-label='Phone intake guidance'
            >
              <div className='bg-primary/10 border-primary/20 text-primary mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-md border'>
                <PhoneCallIcon className='size-4 shrink-0' aria-hidden />
              </div>
              <div className='min-w-0 flex-1 space-y-2'>
                <p className='text-foreground text-[13px] font-semibold'>
                  Complete this intake template with the client on the call
                </p>
                <p className='text-muted-foreground text-[13px] leading-snug font-medium'>
                  The questions match that template: enter what the client
                  shares and move section by section so required fields are
                  covered. Before you submit, use the numbered tabs to review
                  earlier sections. Completed assessments are read-only. Use{' '}
                  <span className='text-foreground font-semibold'>
                    Save as In Progress
                  </span>{' '}
                  if you need to pause without finalizing.
                </p>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='bg-background hover:bg-muted mt-0.5 h-8 border-neutral-300 px-3 text-[12px]! font-semibold'
                  onClick={dismissIntakeGuidancePermanently}
                >
                  Don&apos;t show this again
                </Button>
              </div>
            </div>
          ) : null}

          <Tabs
            value={String(activeSection.id)}
            onValueChange={(value) => {
              if (value === String(activeSection.id)) return;
              const id = Number.parseInt(value, 10);
              if (!Number.isInteger(id)) return;
              const section = sections.find((s) => s.id === id);
              const index = sections.findIndex((s) => s.id === id);
              if (!section || index < 0) return;
              void handleStepClick(section, index);
            }}
          >
            <TabsList
              variant='line'
              className='bg-muted! border-border mb-4 w-full min-w-0 flex-nowrap justify-start overflow-x-auto border [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
            >
              {sections.map((section, index) => (
                <TabsTrigger
                  key={section.id}
                  value={String(section.id)}
                  disabled={isReadonly}
                  className='shrink-0 gap-2 text-[13px] font-semibold'
                >
                  <span className='shrink-0 text-inherit tabular-nums'>
                    {index + 1}.
                  </span>
                  <span className='min-w-0 wrap-break-word text-inherit'>
                    {section.title}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {activeSection.description && (
            <p className='text-muted-foreground text-[13px] font-medium'>
              {activeSection.description}
            </p>
          )}

          <div className='border-border space-y-6 rounded-md border bg-white p-4 md:p-5'>
            <div
              className={
                isLastSectionFileGrid
                  ? 'grid grid-cols-1 gap-4 lg:grid-cols-3'
                  : 'grid grid-cols-1 gap-4 lg:grid-cols-2'
              }
            >
              {activeSection.questions.map((question) => (
                <div
                  key={question.id}
                  className={
                    question.type === 'file' && !isLastSectionFileGrid
                      ? 'lg:col-span-2'
                      : 'lg:col-span-1'
                  }
                >
                  <OnboardingQuestionField
                    question={question}
                    disabled={
                      isReadonly ||
                      saveMutation.isPending ||
                      completeMutation.isPending ||
                      cancelMutation.isPending
                    }
                    value={
                      draftBySection[activeSection.id]?.[question.id] ?? null
                    }
                    error={activeFieldErrors[question.id]}
                    onChange={(value) =>
                      handleQuestionValueChange(
                        activeSection.id,
                        question.id,
                        value,
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='border-border/60 mt-8 flex flex-wrap items-center justify-end gap-3 border-t pt-6'>
          {!isReadonly && (
            <>
              <Button
                type='button'
                variant='outline'
                className='border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive h-10 shrink-0 gap-1.5 rounded-md px-3 text-[13px] font-semibold'
                onClick={() => setCancelDialogOpen(true)}
              >
                <XCircleIcon className='size-3.5' />
                Cancel Intake
              </Button>
              <IntakeCancelConfirmation
                open={cancelDialogOpen}
                onOpenChange={setCancelDialogOpen}
                isSubmitting={cancelMutation.isPending}
                intakeReference={
                  intakeRecord
                    ? intakeRecord.code?.trim() || `#${intakeRecord.id}`
                    : undefined
                }
                cancellationNote={
                  typeof cancelForm.fields.cancellation_note === 'string'
                    ? cancelForm.fields.cancellation_note
                    : ''
                }
                onCancellationNoteChange={(value) =>
                  cancelForm.setData('cancellation_note', value)
                }
                noteError={cancelForm.errors.cancellation_note}
                onConfirmCancel={() => {
                  const validation = OnboardingCancelIntakeSchema.safeParse(
                    cancelForm.fields,
                  );
                  if (!validation.success) {
                    const noteError =
                      validation.error.flatten().fieldErrors
                        .cancellation_note?.[0];
                    if (noteError) {
                      cancelForm.setError('cancellation_note', noteError);
                    }
                    return;
                  }
                  cancelForm.clearErrors('cancellation_note');
                  cancelMutation.mutate();
                }}
              />
            </>
          )}

          <OnboardingCompleteConfirmation
            open={completeConfirmationOpen}
            isSubmitting={
              completeConfirmationOpen &&
              (saveMutation.isPending || completeMutation.isPending)
            }
            intakeReference={
              intakeRecord
                ? intakeRecord.code?.trim() || `#${intakeRecord.id}`
                : undefined
            }
            onOpenChange={(open) => {
              if (
                !open &&
                !saveMutation.isPending &&
                !completeMutation.isPending
              ) {
                setCompleteConfirmationOpen(false);
              }
            }}
            onConfirm={() => {
              void (async () => {
                if (forwardNavigationLockRef.current) return;
                forwardNavigationLockRef.current = true;
                try {
                  const completeDraft = draftBySection[activeSection.id] ?? {};
                  if (isSectionDraftDirty(activeSection, completeDraft)) {
                    const saveResponse = await saveMutation.mutateAsync({
                      section: activeSection,
                      draftSnapshot: completeDraft,
                      silentSuccessToast: true,
                    });
                    if (saveResponse.status === 'error') return;
                  }
                  const completeResponse = await completeMutation.mutateAsync();
                  if (completeResponse.status === 'error') return;
                  setCompleteConfirmationOpen(false);
                } finally {
                  forwardNavigationLockRef.current = false;
                }
              })();
            }}
          />

          <Button
            type='button'
            variant='outline'
            disabled={isReadonly || saveMutation.isPending}
            className='bg-background hover:bg-muted h-10 shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
            onClick={() => {
              const draft = draftBySection[activeSection.id] ?? {};
              if (!isSectionDraftDirty(activeSection, draft)) {
                toast.success(
                  'The section responses have been saved successfully.',
                );
                return;
              }
              saveMutation.mutate({
                section: activeSection,
                draftSnapshot: draft,
              });
            }}
          >
            <SaveIcon className='size-3.5' />
            Save as In Progress
          </Button>

          <Button
            type='button'
            variant='outline'
            disabled={!canGoBack}
            className='bg-background hover:bg-muted h-10 shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
            onClick={() => setSelectedSectionId(sections[sectionIndex - 1].id)}
          >
            <ArrowLeftIcon className='size-3.5' />
            Previous
          </Button>

          {!isLastSection ? (
            <Button
              type='button'
              disabled={isReadonly || saveMutation.isPending || !canGoNext}
              className='h-10 shrink-0 gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
              onClick={async () => {
                if (forwardNavigationLockRef.current) return;
                forwardNavigationLockRef.current = true;
                try {
                  const isValid = validateCurrentSectionRequired(activeSection);
                  if (!isValid) return;

                  const continueDraft = draftBySection[activeSection.id] ?? {};
                  if (isSectionDraftDirty(activeSection, continueDraft)) {
                    const response = await saveMutation.mutateAsync({
                      section: activeSection,
                      draftSnapshot: continueDraft,
                    });
                    if (response.status === 'error') return;
                  }
                  setSelectedSectionId(sections[sectionIndex + 1].id);
                } finally {
                  forwardNavigationLockRef.current = false;
                }
              }}
            >
              Continue
              <ChevronRightIcon className='size-3.5' />
            </Button>
          ) : (
            <Button
              type='button'
              variant='default'
              disabled={
                isReadonly ||
                saveMutation.isPending ||
                completeMutation.isPending
              }
              className='h-10 shrink-0 gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
              onClick={() => {
                const isValid = validateCurrentSectionRequired(activeSection);
                if (!isValid) return;
                setCompleteConfirmationOpen(true);
              }}
            >
              <CheckCircle2Icon className='size-3.5' />
              Complete assessment
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
