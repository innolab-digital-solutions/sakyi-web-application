'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  SaveIcon,
  XCircleIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import TextAreaField from '@/components/shared/form/TextAreaField';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/config/routes';
import { trackOnboardingEvent } from '@/domains/onboarding/analytics';
import {
  buildSaveSectionPayload,
  type DraftBySection,
  findResumeSectionId,
  getRequiredFieldErrorsForSection,
  hydrateDraftAnswersFromSections,
  mapSectionFieldErrorsFromApi,
} from '@/domains/onboarding/mappers/admin';
import { OnboardingCancelIntakeSchema } from '@/domains/onboarding/schemas';
import {
  cancelOnboardingIntake,
  completeOnboardingIntake,
  getOnboardingIntakeById,
  saveOnboardingIntakeSection,
} from '@/domains/onboarding/services';
import type {
  OnboardingIntakeResponse,
  OnboardingIntakeSection,
} from '@/domains/onboarding/types';
import { useForm } from '@/lib/form';
import type { ApiError } from '@/types/api';

import OnboardingQuestionField from './OnboardingQuestionField';

type OnboardingWizardProps = {
  intakeId: number;
};

export default function OnboardingWizard({ intakeId }: OnboardingWizardProps) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sectionErrors, setSectionErrors] = useState<Record<number, string>>(
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
  const hasRedirectedOnReadonly = useRef(false);

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
    toast.info(
      'This intake is no longer editable. Redirecting to detail view.',
    );
    router.replace(
      ROUTES.ADMIN.MODULES.ONBOARDING.INTAKES.DETAIL(String(intakeId)),
    );
  }, [intakeId, isReadonly, router]);

  const saveMutation = useMutation({
    mutationFn: async (section: OnboardingIntakeSection) => {
      const draft = draftBySection[section.id] ?? {};
      const payload = buildSaveSectionPayload(section, draft);
      saveForm.setData('answers', payload.answers);
      return saveOnboardingIntakeSection(intakeId, section.id, payload);
    },
    onSuccess: (response, section) => {
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
      void queryClient.invalidateQueries({
        queryKey: ['onboarding', 'intake', intakeId],
      });
      toast.success('Section saved.');
    },
    onError: () => {
      toast.error('Network error while saving section. Try again.');
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => completeOnboardingIntake(intakeId),
    onSuccess: (response) => {
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
      toast.success('Intake completed.');
      router.push(
        ROUTES.ADMIN.MODULES.ONBOARDING.INTAKES.DETAIL(String(intakeId)),
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
    onSuccess: (response) => {
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
      setCancelDialogOpen(false);
      toast.success('Intake cancelled.');
      router.push(
        ROUTES.ADMIN.MODULES.ONBOARDING.INTAKES.DETAIL(String(intakeId)),
      );
    },
    onError: () => {
      toast.error('Network error while cancelling intake.');
    },
  });

  if (intakeQuery.isPending) {
    return <p className='text-muted-foreground text-sm'>Loading intake...</p>;
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
  const clientUser = intakeRecord?.user;
  const activeFieldErrors = fieldErrorsBySection[activeSection.id] ?? {};
  const canGoBack = sectionIndex > 0;
  const canGoNext = sectionIndex >= 0 && sectionIndex < sections.length - 1;
  const isLastSection = !canGoNext;
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
      toast.error('Please complete required fields in this step.');
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

    // Block moving forward when required fields are missing.
    const isValid = validateCurrentSectionRequired(activeSection);
    if (!isValid) return;

    // Keep save-per-step behavior when progressing to future steps.
    const response = await saveMutation.mutateAsync(activeSection);
    if (response.status === 'error') return;
    setSelectedSectionId(targetSection.id);
  };

  return (
    <div className='mx-auto w-full max-w-6xl space-y-6'>
      <Card className='border-border/70 overflow-hidden shadow-sm'>
        <CardHeader className='bg-muted/25 border-border space-y-4 border-b pb-5'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div className='space-y-1'>
              <CardTitle className='text-base md:text-lg'>
                {intakeQuery.data?.data.template?.title ?? 'Phone intake'}
              </CardTitle>
              <p className='text-muted-foreground text-sm'>
                Phone intake: work through each section with the client. Answers
                save when you move forward or tap Save draft.
              </p>
            </div>
          </div>

          {intakeRecord && (
            <div className='bg-background/80 border-border/80 rounded-lg border px-4 py-3'>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='min-w-0 space-y-0.5'>
                  <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                    Client
                  </p>
                  {clientUser ? (
                    <>
                      <p className='text-foreground truncate font-semibold'>
                        {clientUser.name}
                      </p>
                      <p className='text-muted-foreground truncate text-sm'>
                        {clientUser.email}
                      </p>
                    </>
                  ) : (
                    <p className='text-muted-foreground text-sm'>
                      Client information unavailable.
                    </p>
                  )}
                </div>
                <div className='flex flex-wrap items-center gap-3 sm:justify-end'>
                  <div className='text-left sm:text-right'>
                    <p className='text-muted-foreground text-xs'>Intake</p>
                    <p className='text-foreground font-mono text-sm font-medium'>
                      #{intakeRecord.id}
                    </p>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    asChild
                    className='shrink-0'
                  >
                    <Link href={ROUTES.ADMIN.MODULES.ONBOARDING.INTAKES.LIST}>
                      Intake queue
                    </Link>
                  </Button>
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
              <div className='text-muted-foreground flex items-center justify-between text-xs'>
                <span>
                  Required answered: {progress?.answered_required ?? 0}/
                  {progress?.total_required ?? 0}
                </span>
                <span>{Math.round(completionRate)}%</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-5 p-4 md:p-6'>
          {isReadonly && (
            <div className='bg-muted border-border mb-4 rounded-md border p-3 text-sm'>
              <p className='font-medium'>Read only</p>
              <p className='text-muted-foreground'>
                This intake is {status}. Editing is disabled.
              </p>
            </div>
          )}

          <div className='space-y-4'>
            <div className='flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
              {sections.map((section, index) => {
                const isActive = section.id === activeSection.id;
                const isPassed = index < sectionIndex;
                return (
                  <button
                    key={section.id}
                    type='button'
                    onClick={() => void handleStepClick(section, index)}
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
                    <span className='font-medium whitespace-nowrap'>
                      {section.title}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className='border-border space-y-5 rounded-md border bg-white p-4 md:p-5'>
              {activeSection.description && (
                <p className='text-muted-foreground text-sm'>
                  {activeSection.description}
                </p>
              )}

              {sectionErrors[activeSection.id] && (
                <div className='border-destructive/30 bg-destructive/10 space-y-2 rounded-md border p-3 text-sm'>
                  <p className='text-destructive font-medium'>
                    Could not save section
                  </p>
                  <div className='space-y-2'>
                    <p>{sectionErrors[activeSection.id]}</p>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => saveMutation.mutate(activeSection)}
                    >
                      Retry save
                    </Button>
                  </div>
                </div>
              )}

              <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                {activeSection.questions.map((question) => (
                  <div
                    key={question.id}
                    className={
                      question.type === 'file' ||
                      question.type === 'multiselect'
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

          <div className='bg-background/95 sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t px-4 pt-4 pb-2 md:static md:mx-0 md:border-0 md:px-0 md:pt-2 md:pb-0'>
            {!isReadonly && (
              <AlertDialog
                open={cancelDialogOpen}
                onOpenChange={setCancelDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    type='button'
                    variant='outline'
                    className='text-destructive border-destructive/35 hover:bg-destructive/10 hover:text-destructive min-w-28'
                  >
                    <XCircleIcon className='size-4' />
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel intake?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cancels the current intake. You can add an
                      optional note before confirming.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <div className='py-1'>
                    <TextAreaField
                      label='Cancellation note (optional)'
                      value={
                        typeof cancelForm.fields.cancellation_note === 'string'
                          ? cancelForm.fields.cancellation_note
                          : ''
                      }
                      onChange={(event) =>
                        cancelForm.setData(
                          'cancellation_note',
                          event.target.value,
                        )
                      }
                      error={cancelForm.errors.cancellation_note}
                    />
                  </div>

                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={cancelMutation.isPending}>
                      Keep intake
                    </AlertDialogCancel>
                    <Button
                      type='button'
                      variant='destructive'
                      disabled={cancelMutation.isPending}
                      onClick={() => {
                        const validation =
                          OnboardingCancelIntakeSchema.safeParse(
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
                    >
                      Confirm cancel
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <Button
              type='button'
              variant='secondary'
              disabled={isReadonly || saveMutation.isPending}
              className='min-w-32'
              onClick={() => saveMutation.mutate(activeSection)}
            >
              <SaveIcon className='size-4' />
              Save draft
            </Button>

            <Button
              type='button'
              variant='outline'
              disabled={!canGoBack}
              className='min-w-24'
              onClick={() =>
                setSelectedSectionId(sections[sectionIndex - 1].id)
              }
            >
              <ArrowLeftIcon className='size-4' />
              Back
            </Button>

            {!isLastSection ? (
              <Button
                type='button'
                disabled={isReadonly || saveMutation.isPending || !canGoNext}
                className='min-w-24'
                onClick={async () => {
                  const isValid = validateCurrentSectionRequired(activeSection);
                  if (!isValid) return;

                  const response =
                    await saveMutation.mutateAsync(activeSection);
                  if (response.status === 'error') return;
                  setSelectedSectionId(sections[sectionIndex + 1].id);
                }}
              >
                Next
                <ChevronRightIcon className='size-4' />
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
                className='min-w-28'
                onClick={async () => {
                  const isValid = validateCurrentSectionRequired(activeSection);
                  if (!isValid) return;

                  const saveResponse =
                    await saveMutation.mutateAsync(activeSection);
                  if (saveResponse.status === 'error') return;

                  completeMutation.mutate();
                }}
              >
                <CheckCircle2Icon className='size-4' />
                Complete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
