'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parse, parseISO, startOfDay } from 'date-fns';
import { AlertTriangleIcon, ArrowLeftIcon, CheckCircle2Icon, PlusIcon, SaveIcon, Trash2Icon } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { toast } from 'sonner';

import ComboboxField, { type ComboboxOption } from '@/components/shared/form/ComboBoxField';
import DatePickerField from '@/components/shared/form/DatePickerField';
import TextAreaField from '@/components/shared/form/TextAreaField';
import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints/lookup';
import { ROUTES } from '@/config/routes';
import {
  getCarePlanBuilderById,
  patchCarePlanBasics,
  postCarePlanActivate,
  postCarePlanGenerateDays,
  postCarePlanRevision,
  postCarePlanValidate,
  putCarePlanSectionItems,
} from '@/domains/care-plans/services';
import type {
  CarePlanSectionItem,
  CarePlanSectionKey,
  CarePlanValidationIssue,
} from '@/domains/care-plans/types/admin';
import { getUnitsLookup } from '@/domains/units/services';
import { http } from '@/lib/api/client';

const SECTIONS: ReadonlyArray<{ key: CarePlanSectionKey; label: string }> = [
  { key: 'nutrition', label: 'Nutrition' },
  { key: 'movement', label: 'Movement' },
  { key: 'activity', label: 'Activity' },
  { key: 'recovery', label: 'Recovery' },
];

type CarePlanBuilderProps = {
  carePlanId: number;
  mode: 'edit' | 'detail';
};

type MovementExerciseLookupItem = {
  id: number;
  name: string;
  description: string | null;
  difficulty: string | null;
  category: {
    id: number;
    name: string;
  } | null;
};

function normalizeStatus(raw: string | null | undefined): string {
  return (raw ?? '').trim().toLowerCase();
}

function parseYmdLocal(ymd: string): Date | undefined {
  if (!ymd?.trim()) return undefined;
  const d = parse(ymd.trim(), 'yyyy-MM-dd', new Date());
  return Number.isNaN(d.getTime()) ? undefined : startOfDay(d);
}

function formatDateCell(iso: string | null | undefined): string {
  if (!iso?.trim()) return '—';
  try {
    return format(parseISO(iso), 'dd-MMMM-yyyy');
  } catch {
    return iso;
  }
}

function sectionItemTitle(item: CarePlanSectionItem, index: number): string {
  const title = typeof item.title === 'string' ? item.title.trim() : '';
  if (title) return title;
  return `Item ${index + 1}`;
}

function toEditableSectionItems(items: CarePlanSectionItem[]): CarePlanSectionItem[] {
  return items.map((item) => ({
    ...item,
    title: typeof item.title === 'string' ? item.title : '',
    guidance:
      typeof item.guidance === 'string'
        ? item.guidance
        : typeof item.notes === 'string'
          ? item.notes
          : '',
    target_value:
      typeof item.target_value === 'number' || typeof item.target_value === 'string'
        ? item.target_value
        : '',
    target_unit: typeof item.target_unit === 'string' ? item.target_unit : '',
    movement_exercise_id:
      typeof item.movement_exercise_id === 'number' ||
      typeof item.movement_exercise_id === 'string'
        ? item.movement_exercise_id
        : typeof item.exercise_id === 'number' || typeof item.exercise_id === 'string'
          ? item.exercise_id
          : '',
    exercises: Array.isArray(item.exercises)
      ? item.exercises
          .map((exercise) => {
            const id = String(exercise?.movement_exercise_id ?? '').trim();
            if (!id) return null;
            return {
              movement_exercise_id: id,
              sets:
                exercise?.sets != null && String(exercise.sets).trim() !== ''
                  ? exercise.sets
                  : null,
              reps:
                exercise?.reps != null && String(exercise.reps).trim() !== ''
                  ? exercise.reps
                  : null,
              rest_seconds:
                exercise?.rest_seconds != null &&
                String(exercise.rest_seconds).trim() !== ''
                  ? exercise.rest_seconds
                  : null,
            };
          })
          .filter((x): x is NonNullable<typeof x> => x !== null)
      : [],
  }));
}

export default function CarePlanBuilder({ carePlanId, mode }: CarePlanBuilderProps) {
  const queryClient = useQueryClient();
  const isDetailMode = mode === 'detail';
  const [selectedDayId, setSelectedDayId] = React.useState<number | null>(null);
  const [activeSection, setActiveSection] = React.useState<CarePlanSectionKey>('nutrition');

  const [basicsForm, setBasicsForm] = React.useState({
    starts_on: '',
    ends_on: '',
  });
  const [generateForm, setGenerateForm] = React.useState({
    replace_existing: false,
  });
  const [basicsErrors, setBasicsErrors] = React.useState<{
    starts_on?: string;
    ends_on?: string;
  }>({});
  const [sectionSaveError, setSectionSaveError] = React.useState<
    string | undefined
  >();
  const [sectionUnitErrors, setSectionUnitErrors] = React.useState<
    Record<number, string>
  >({});
  const [sectionMovementErrors, setSectionMovementErrors] = React.useState<
    Record<number, string>
  >({});
  const [validationIssues, setValidationIssues] = React.useState<CarePlanValidationIssue[]>([]);
  const [hasValidated, setHasValidated] = React.useState(false);

  const builderQuery = useQuery({
    queryKey: ['care-plan', carePlanId, 'builder'],
    queryFn: async () => {
      const response = await getCarePlanBuilderById(carePlanId);
      if (response.status === 'error') {
        throw new Error(response.message ?? 'Could not load care plan builder.');
      }
      return response.data;
    },
  });

  const unitsLookupQuery = useQuery({
    queryKey: ['lookup', LOOKUP_ENDPOINTS.UNITS],
    queryFn: async () => {
      const response = await getUnitsLookup();
      if (response.status !== 'success') return [];
      return response.data;
    },
  });

  const movementExercisesLookupQuery = useQuery({
    queryKey: ['lookup', LOOKUP_ENDPOINTS.MOVEMENT_EXERCISES],
    queryFn: async () => {
      const response = await http.get<MovementExerciseLookupItem[]>(
        LOOKUP_ENDPOINTS.MOVEMENT_EXERCISES,
      );
      if (response.status !== 'success') return [];
      return response.data;
    },
  });

  const unitOptions = React.useMemo<ComboboxOption[]>(() => {
    const rows = unitsLookupQuery.data ?? [];
    return rows.map((row) => ({
      value: row.abbreviation,
      label: `${row.name} (${row.abbreviation})`,
      keywords: [row.name, row.abbreviation],
    }));
  }, [unitsLookupQuery.data]);

  const movementExerciseOptions = React.useMemo<ComboboxOption[]>(() => {
    const rows = movementExercisesLookupQuery.data ?? [];
    return rows.map((row) => {
      const category = row.category?.name?.trim() || 'Uncategorized';
      const difficulty = row.difficulty?.trim() || 'No difficulty';
      return {
        value: String(row.id),
        label: row.name,
        keywords: [row.name, category, difficulty, row.description ?? ''],
        content: (
          <div className='flex min-w-0 flex-col'>
            <span className='text-[13px] font-semibold'>{row.name}</span>
            <span className='text-muted-foreground text-xs'>
              {category} · {difficulty}
            </span>
          </div>
        ),
      };
    });
  }, [movementExercisesLookupQuery.data]);

  const builder = builderQuery.data;
  const normalizedStatus = normalizeStatus(builder?.status);
  const editable = !isDetailMode && normalizedStatus === 'draft';
  const hasGeneratedDays = (builder?.days.length ?? 0) > 0;

  React.useEffect(() => {
    if (!builder) return;
    setBasicsErrors({});
    setBasicsForm({
      starts_on: builder.starts_on ?? '',
      ends_on: builder.ends_on ?? '',
    });
    if (builder.days.length > 0) {
      setSelectedDayId((current) => {
        const stillExists = builder.days.some((day) => day.id === current);
        return stillExists ? current : builder.days[0].id;
      });
    } else {
      setSelectedDayId(null);
    }
  }, [builder]);

  const selectedDay = React.useMemo(
    () => builder?.days.find((day) => day.id === selectedDayId) ?? null,
    [builder, selectedDayId],
  );

  const sectionItems = React.useMemo(
    () =>
      selectedDay ? toEditableSectionItems(selectedDay.sections[activeSection] ?? []) : [],
    [selectedDay, activeSection],
  );

  const [localItems, setLocalItems] = React.useState<CarePlanSectionItem[]>([]);
  React.useEffect(() => {
    setLocalItems(sectionItems);
  }, [sectionItems]);

  React.useEffect(() => {
    setSectionSaveError(undefined);
    setSectionUnitErrors({});
    setSectionMovementErrors({});
  }, [selectedDayId, activeSection]);

  const invalidateBuilder = React.useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ['care-plan', carePlanId, 'builder'],
    });
    void queryClient.invalidateQueries({
      queryKey: ['table', '/web/admin/care-plans'],
    });
  }, [carePlanId, queryClient]);

  const basicsMutation = useMutation({
    mutationFn: async (payload: { starts_on: string; ends_on: string }) => {
      const response = await patchCarePlanBasics(carePlanId, payload);
      if (response.status === 'error') {
        throw new Error(response.message ?? 'Could not update plan basics.');
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success('Care plan basics saved.');
      setValidationIssues([]);
      setHasValidated(false);
      invalidateBuilder();
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Could not update plan basics.');
    },
  });

  const validateBasicsDates = (): boolean => {
    const next: { starts_on?: string; ends_on?: string } = {};
    if (!basicsForm.starts_on.trim()) {
      next.starts_on = 'Start date is required.';
    }
    if (!basicsForm.ends_on.trim()) {
      next.ends_on = 'End date is required.';
    }
    const startD = parseYmdLocal(basicsForm.starts_on);
    const endD = parseYmdLocal(basicsForm.ends_on);
    if (startD && endD && endD.getTime() < startD.getTime()) {
      next.ends_on = 'End date must be on or after the start date.';
    }
    setBasicsErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSaveBasics = () => {
    if (!validateBasicsDates()) return;
    basicsMutation.mutate({
      starts_on: basicsForm.starts_on.trim(),
      ends_on: basicsForm.ends_on.trim(),
    });
  };

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await postCarePlanGenerateDays(carePlanId, {
        replace_existing: generateForm.replace_existing,
      });
      if (response.status === 'error') {
        throw new Error(response.message ?? 'Could not generate days.');
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success('Care plan days generated successfully.');
      setValidationIssues([]);
      setHasValidated(false);
      invalidateBuilder();
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Could not generate days.');
    },
  });

  const handleGenerateDays = () => {
    if (!validateBasicsDates()) return;
    generateMutation.mutate();
  };

  const sectionSaveMutation = useMutation({
    mutationFn: async (dayId: number) => {
      const response = await putCarePlanSectionItems(
        carePlanId,
        dayId,
        activeSection,
        localItems,
      );
      if (response.status === 'error') {
        throw new Error(response.message ?? 'Could not save section items.');
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success(`${SECTIONS.find((x) => x.key === activeSection)?.label} section saved.`);
      setValidationIssues([]);
      setHasValidated(false);
      invalidateBuilder();
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Could not save section items.');
    },
  });

  const handleSaveSection = () => {
    setSectionSaveError(undefined);
    setSectionUnitErrors({});
    setSectionMovementErrors({});

    if (!selectedDay) {
      setSectionSaveError('Please select a day first.');
      return;
    }

    if (activeSection === 'movement') {
      const movementErrors: Record<number, string> = {};
      for (let i = 0; i < localItems.length; i++) {
        const item = localItems[i];
        const exercises = Array.isArray(item?.exercises) ? item.exercises : [];
        if (exercises.length === 0) {
          movementErrors[i] = 'Please select an exercise.';
        }
      }
      if (Object.keys(movementErrors).length > 0) {
        setSectionMovementErrors(movementErrors);
        return;
      }
    } else {
      const unitErrors: Record<number, string> = {};
      for (let i = 0; i < localItems.length; i++) {
        const item = localItems[i];
        const val = String(item?.target_value ?? '').trim();
        const unit = String(item?.target_unit ?? '').trim();
        if (val && !unit) {
          unitErrors[i] = 'Select a unit when a target value is set.';
        }
      }
      if (Object.keys(unitErrors).length > 0) {
        setSectionUnitErrors(unitErrors);
        return;
      }
    }

    sectionSaveMutation.mutate(selectedDay.id);
  };

  const validateMutation = useMutation({
    mutationFn: async () => {
      const response = await postCarePlanValidate(carePlanId);
      if (response.status === 'error') {
        throw new Error(response.message ?? 'Could not validate care plan.');
      }
      return response.data;
    },
    onSuccess: (data) => {
      setHasValidated(true);
      setValidationIssues(data.issues ?? []);
      if (data.is_valid) {
        toast.success('Care plan is valid and ready for activation.');
      } else {
        toast.error('Care plan has validation issues.');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Could not validate care plan.');
    },
  });

  const activateMutation = useMutation({
    mutationFn: async () => {
      const response = await postCarePlanActivate(carePlanId);
      if (response.status === 'error') {
        throw new Error(response.message ?? 'Could not activate care plan.');
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success('Care plan activated successfully.');
      invalidateBuilder();
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Could not activate care plan.');
    },
  });

  const revisionMutation = useMutation({
    mutationFn: async () => {
      const response = await postCarePlanRevision(carePlanId);
      if (response.status === 'error') {
        throw new Error(response.message ?? 'Could not create care plan revision.');
      }
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Care plan revision created.');
      if (data?.id != null) {
        window.location.href = ROUTES.ADMIN.MODULES.CARE_PLANS.BUILDER(String(data.id));
      }
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Could not create care plan revision.');
    },
  });

  const setItemField = (
    index: number,
    field:
      | 'title'
      | 'guidance'
      | 'target_value'
      | 'target_unit'
      | 'movement_exercise_id'
      | 'exercise_id',
    value: string,
  ) => {
    setLocalItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
    if (field === 'target_unit' || field === 'target_value') {
      setSectionUnitErrors((prev) => {
        if (prev[index] == null) return prev;
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
    if (field === 'movement_exercise_id' || field === 'exercise_id') {
      setSectionMovementErrors((prev) => {
        if (prev[index] == null) return prev;
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  };

  const setMovementExerciseField = (
    itemIndex: number,
    exerciseId: string,
    field: 'sets' | 'reps' | 'rest_seconds',
    value: string,
  ) => {
    setLocalItems((prev) =>
      prev.map((entry, idx) => {
        if (idx !== itemIndex) return entry;
        const existing = Array.isArray(entry.exercises) ? entry.exercises : [];
        return {
          ...entry,
          exercises: existing.map((exercise) =>
            String(exercise.movement_exercise_id) === exerciseId
              ? {
                  ...exercise,
                  [field]: value.trim() === '' ? null : value,
                }
              : exercise,
          ),
        };
      }),
    );
  };

  const startDateForBasics = parseYmdLocal(basicsForm.starts_on);
  const basicsEndCalendarDisabled = startDateForBasics
    ? { before: startDateForBasics }
    : undefined;

  const addItem = () => {
    setLocalItems((prev) => [
      ...prev,
      {
        title: '',
        guidance: '',
        target_value: '',
        target_unit: '',
        movement_exercise_id: '',
        exercises: [],
      },
    ]);
  };

  const removeItem = (index: number) => {
    setLocalItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  if (builderQuery.isPending) {
    return <div className='text-muted-foreground text-sm'>Loading care plan builder...</div>;
  }

  if (builderQuery.isError) {
    return (
      <div className='text-destructive rounded-md border p-4 text-sm'>
        {builderQuery.error instanceof Error
          ? builderQuery.error.message
          : 'Could not load care plan builder.'}
      </div>
    );
  }

  if (!builder) return null;

  return (
    <div className='space-y-6'>
      <section className='border-border rounded-md border bg-white p-4 shadow-xs sm:p-5'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div className='space-y-1'>
            <p className='text-muted-foreground text-[10px]! font-semibold tracking-wide uppercase'>
              Care Plan Builder
            </p>
            <h2 className='text-foreground text-sm font-semibold'>
              {builder.code?.trim() || `Care Plan #${builder.id}`}
            </h2>
            <p className='text-muted-foreground text-[13px] font-medium'>
              Status: <span className='text-foreground font-semibold'>{builder.status}</span> · Cycle:{' '}
              <span className='text-foreground font-semibold'>{builder.cycle_number ?? '—'}</span> · Start:{' '}
              <span className='text-foreground font-semibold'>{formatDateCell(builder.starts_on)}</span> · End:{' '}
              <span className='text-foreground font-semibold'>{formatDateCell(builder.ends_on)}</span>
            </p>
          </div>
          <Button
            variant='outline'
            asChild
            className='bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            <Link href={ROUTES.ADMIN.MODULES.CARE_PLANS.LIST}>
              <ArrowLeftIcon className='size-3.5' />
              Back to care plans
            </Link>
          </Button>
        </div>

        {!editable ? (
          <div className='mt-4 flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs text-amber-900'>
            <AlertTriangleIcon className='mt-0.5 size-3.5 shrink-0' />
            <div className='space-y-1'>
              <p className='font-semibold'>
                This plan is not editable in-place because it is {builder.status}.
              </p>
              {!isDetailMode ? (
                <Button
                  size='sm'
                  className='h-8 px-3 text-xs font-semibold'
                  disabled={revisionMutation.isPending}
                  onClick={() => revisionMutation.mutate()}
                >
                  {revisionMutation.isPending ? 'Creating revision…' : 'Create revision'}
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>

      <section className='border-border rounded-md border bg-white p-4 shadow-xs sm:p-5'>
        <div className='space-y-4'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div>
              <p className='text-foreground text-sm font-semibold'>Plan setup</p>
              <p className='text-muted-foreground text-[13px] font-medium'>
                Set required dates, choose replacement behavior, then generate days to unlock the builder.
              </p>
            </div>
            {hasGeneratedDays ? (
              <span className='rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800'>
                Setup complete
              </span>
            ) : (
              <span className='rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800'>
                Setup required
              </span>
            )}
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <DatePickerField
              label='Start Date'
              required
              presets
              clearable={false}
              dateFormat='PP'
              className='[&_button]:text-[13px] md:[&_button]:text-[13px]'
              value={startDateForBasics}
              onChange={(d) => {
                const next = d ? startOfDay(d) : undefined;
                const startsYmd = next ? format(next, 'yyyy-MM-dd') : '';
                setBasicsForm((prev) => {
                  let ends = prev.ends_on;
                  if (next && prev.ends_on.trim()) {
                    const endD = parseYmdLocal(prev.ends_on);
                    if (endD && endD.getTime() < next.getTime()) ends = '';
                  }
                  return { starts_on: startsYmd, ends_on: ends };
                });
                setBasicsErrors((p) => {
                  const n = { ...p };
                  delete n.starts_on;
                  delete n.ends_on;
                  return n;
                });
              }}
              error={basicsErrors.starts_on}
              disabled={!editable || basicsMutation.isPending}
            />
            <DatePickerField
              label='End Date'
              required
              presets={false}
              placeholder='Pick end date'
              dateFormat='PP'
              className='[&_button]:text-[13px] md:[&_button]:text-[13px]'
              value={parseYmdLocal(basicsForm.ends_on)}
              onChange={(d) => {
                setBasicsForm((prev) => ({
                  ...prev,
                  ends_on: d ? format(startOfDay(d), 'yyyy-MM-dd') : '',
                }));
                setBasicsErrors((p) => {
                  const n = { ...p };
                  delete n.ends_on;
                  return n;
                });
              }}
              error={basicsErrors.ends_on}
              calendarProps={{
                disabled: basicsEndCalendarDisabled,
              }}
              disabled={!editable || basicsMutation.isPending}
            />
          </div>

          <label className='flex items-center gap-2 text-[13px] font-medium'>
            <input
              type='checkbox'
              checked={generateForm.replace_existing}
              onChange={(event) =>
                setGenerateForm((prev) => ({
                  ...prev,
                  replace_existing: event.target.checked,
                }))
              }
              disabled={!editable || generateMutation.isPending}
            />
            Replace existing days when generating
          </label>

          {editable ? (
            <div className='flex flex-wrap justify-end gap-2'>
              <Button
                variant='outline'
                onClick={handleSaveBasics}
                disabled={basicsMutation.isPending}
                className='h-10 gap-1.5 border-neutral-300 px-3 text-[13px]! font-semibold'
              >
                <SaveIcon className='size-3.5' />
                {basicsMutation.isPending ? 'Saving…' : 'Save setup'}
              </Button>
              <Button
                onClick={handleGenerateDays}
                disabled={generateMutation.isPending}
                className='h-10 gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
              >
                {generateMutation.isPending ? 'Generating…' : 'Continue to builder'}
              </Button>
            </div>
          ) : null}
        </div>
      </section>

      <section className='border-border rounded-md border bg-white p-4 shadow-xs sm:p-5'>
        <div className='mb-4 flex flex-wrap items-start justify-between gap-3'>
          <div>
            <p className='text-foreground text-sm font-semibold'>Day builder</p>
            <p className='text-muted-foreground text-[13px] font-medium'>
              Build each day by section, then validate and activate when ready.
            </p>
          </div>
          {!hasGeneratedDays ? (
            <span className='rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800'>
              Locked until setup is complete
            </span>
          ) : null}
        </div>

        {!hasGeneratedDays ? (
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Complete setup and click <span className='font-semibold'>Continue to builder</span> to generate days.
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
              <div className='border-border rounded-md border lg:col-span-3'>
                <div className='border-border bg-muted/30 border-b px-3 py-2 text-xs font-semibold uppercase'>
                  Days
                </div>
                <div className='max-h-80 overflow-y-auto p-2'>
                  {builder.days.length === 0 ? (
                    <p className='text-muted-foreground p-2 text-sm'>No days generated yet.</p>
                  ) : (
                    builder.days.map((day) => (
                      <button
                        key={day.id}
                        type='button'
                        className={`mb-1 w-full rounded-md px-2.5 py-2 text-left text-[13px] font-medium ${
                          selectedDayId === day.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedDayId(day.id)}
                      >
                        Day {day.day_number}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className='lg:col-span-9'>
                {!selectedDay ? (
                  <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
                    Select a day to manage section items.
                  </div>
                ) : (
                  <Tabs
                    value={activeSection}
                    onValueChange={(value) => setActiveSection(value as CarePlanSectionKey)}
                  >
                    <TabsList variant='line' className='bg-muted! border-border mb-4 w-full border'>
                      {SECTIONS.map((section) => (
                        <TabsTrigger
                          key={section.key}
                          value={section.key}
                          className='flex-1 text-[13px] font-semibold'
                        >
                          {section.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {SECTIONS.map((section) => (
                      <TabsContent key={section.key} value={section.key} className='space-y-3'>
                        {localItems.length === 0 ? (
                          <p className='text-muted-foreground text-sm'>
                            No items yet in this section.
                          </p>
                        ) : null}

                        {localItems.map((item, index) => (
                          <div key={`${index}-${item.id ?? 'new'}`} className='border-border rounded-md border p-3'>
                            <div className='mb-3 flex items-center justify-between'>
                              <p className='text-sm font-semibold'>{sectionItemTitle(item, index)}</p>
                              {editable ? (
                                <Button
                                  type='button'
                                  variant='outline'
                                  size='sm'
                                  className='h-8 gap-1.5 border-neutral-300 px-2.5 text-[12px]! font-semibold'
                                  onClick={() => removeItem(index)}
                                >
                                  <Trash2Icon className='size-3.5' />
                                  Remove
                                </Button>
                              ) : null}
                            </div>
                            <div className='space-y-3'>
                              <TextField
                                label='Title'
                                value={String(item.title ?? '')}
                                onChange={(event) => setItemField(index, 'title', event.target.value)}
                                disabled={!editable}
                              />
                              <TextAreaField
                                label='Guidance'
                                rows={3}
                                value={String(item.guidance ?? '')}
                                onChange={(event) =>
                                  setItemField(index, 'guidance', event.target.value)
                                }
                                disabled={!editable}
                              />
                              {activeSection === 'movement' ? (
                                <>
                                  <ComboboxField
                                    label='Exercises'
                                    required
                                    multiple
                                    placeholder='Select exercises…'
                                    searchPlaceholder='Search exercises…'
                                    emptyMessage='No exercises found.'
                                    options={movementExerciseOptions}
                                    value={(item.exercises ?? []).map((exercise) =>
                                      String(exercise.movement_exercise_id),
                                    )}
                                    onChange={(values) => {
                                      const selectedNames = values
                                        .map(
                                          (v) =>
                                            movementExerciseOptions.find(
                                              (option) => option.value === v,
                                            )?.label ?? '',
                                        )
                                        .filter(Boolean);
                                      setLocalItems((prev) =>
                                        prev.map((entry, itemIndex) =>
                                          itemIndex === index
                                            ? {
                                                ...entry,
                                                exercises: values.map((v) => {
                                                  const existingExercise =
                                                    (entry.exercises ?? []).find(
                                                      (exercise) =>
                                                        String(
                                                          exercise.movement_exercise_id,
                                                        ) === v,
                                                    );
                                                  return existingExercise
                                                    ? existingExercise
                                                    : {
                                                        movement_exercise_id: v,
                                                        sets: null,
                                                        reps: null,
                                                        rest_seconds: null,
                                                      };
                                                }),
                                                movement_exercise_id:
                                                  values[0] != null ? values[0] : '',
                                                exercise_id:
                                                  values[0] != null ? values[0] : '',
                                                title:
                                                  entry.title?.trim()
                                                    ? entry.title
                                                    : selectedNames.join(', '),
                                              }
                                            : entry,
                                        ),
                                      );
                                      setSectionMovementErrors((prev) => {
                                        if (prev[index] == null) return prev;
                                        const next = { ...prev };
                                        delete next[index];
                                        return next;
                                      });
                                    }}
                                    error={sectionMovementErrors[index]}
                                    disabled={
                                      !editable ||
                                      movementExercisesLookupQuery.isLoading
                                    }
                                  />
                                  {(item.exercises ?? []).length > 0 ? (
                                    <div className='space-y-2'>
                                      {(item.exercises ?? []).map((exercise) => {
                                        const exerciseId = String(
                                          exercise.movement_exercise_id,
                                        );
                                        const exerciseName =
                                          movementExerciseOptions.find(
                                            (option) =>
                                              option.value === exerciseId,
                                          )?.label ?? `Exercise ${exerciseId}`;
                                        return (
                                          <div
                                            key={exerciseId}
                                            className='bg-muted/20 space-y-2 rounded-md border p-2.5'
                                          >
                                            <p className='text-foreground text-xs font-semibold'>
                                              {exerciseName}
                                            </p>
                                            <div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
                                              <TextField
                                                label='Sets'
                                                type='number'
                                                min={1}
                                                max={1000}
                                                value={String(
                                                  exercise.sets ?? '',
                                                )}
                                                onChange={(event) =>
                                                  setMovementExerciseField(
                                                    index,
                                                    exerciseId,
                                                    'sets',
                                                    event.target.value,
                                                  )
                                                }
                                                disabled={!editable}
                                              />
                                              <TextField
                                                label='Reps'
                                                type='number'
                                                min={1}
                                                max={1000}
                                                value={String(
                                                  exercise.reps ?? '',
                                                )}
                                                onChange={(event) =>
                                                  setMovementExerciseField(
                                                    index,
                                                    exerciseId,
                                                    'reps',
                                                    event.target.value,
                                                  )
                                                }
                                                disabled={!editable}
                                              />
                                              <TextField
                                                label='Rest Seconds'
                                                type='number'
                                                min={0}
                                                max={7200}
                                                value={String(
                                                  exercise.rest_seconds ?? '',
                                                )}
                                                onChange={(event) =>
                                                  setMovementExerciseField(
                                                    index,
                                                    exerciseId,
                                                    'rest_seconds',
                                                    event.target.value,
                                                  )
                                                }
                                                disabled={!editable}
                                              />
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : null}
                                </>
                              ) : (
                                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                                  <TextField
                                    label='Target value'
                                    value={String(item.target_value ?? '')}
                                    onChange={(event) =>
                                      setItemField(index, 'target_value', event.target.value)
                                    }
                                    disabled={!editable}
                                  />
                                  <ComboboxField
                                    label='Target unit'
                                    placeholder='Select unit…'
                                    searchPlaceholder='Search unit…'
                                    emptyMessage='No units found.'
                                    options={unitOptions}
                                    value={
                                      typeof item.target_unit === 'string' &&
                                      item.target_unit.trim() !== ''
                                        ? item.target_unit
                                        : null
                                    }
                                    onChange={(value) =>
                                      setItemField(index, 'target_unit', value ?? '')
                                    }
                                    error={sectionUnitErrors[index]}
                                    disabled={!editable}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {editable ? (
                          <div className='space-y-2'>
                            {sectionSaveError ? (
                              <p className='text-destructive text-[13px] font-medium'>
                                {sectionSaveError}
                              </p>
                            ) : null}
                            <div className='flex flex-wrap items-center justify-end gap-2'>
                              <Button
                                type='button'
                                variant='outline'
                                className='h-10 gap-1.5 border-neutral-300 px-3 text-[13px]! font-semibold'
                                onClick={addItem}
                              >
                                <PlusIcon className='size-3.5' />
                                Add item
                              </Button>
                              <Button
                                type='button'
                                className='h-10 gap-1.5 px-3 text-[13px]! font-semibold'
                                disabled={sectionSaveMutation.isPending}
                                onClick={handleSaveSection}
                              >
                                <SaveIcon className='size-3.5' />
                                {sectionSaveMutation.isPending
                                  ? 'Saving…'
                                  : 'Save section'}
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </TabsContent>
                    ))}
                  </Tabs>
                )}
              </div>
            </div>

            <div className='rounded-md border p-3'>
              <p className='text-sm font-semibold'>Validation summary</p>
              {!hasValidated ? (
                <p className='text-muted-foreground mt-1 text-sm'>
                  Validate the plan after editing sections to check activation readiness.
                </p>
              ) : validationIssues.length === 0 ? (
                <p className='mt-1 text-sm font-medium text-emerald-700'>
                  No issues found. This plan is ready to activate.
                </p>
              ) : (
                <ul className='mt-2 space-y-2'>
                  {validationIssues.map((issue, index) => (
                    <li key={`${issue.field}-${index}`} className='rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm'>
                      <p className='font-semibold'>{issue.field}</p>
                      <p>{issue.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className='flex flex-wrap justify-end gap-2'>
              <Button
                variant='outline'
                className='h-10 border-neutral-300 px-3 text-[13px]! font-semibold'
                onClick={() => validateMutation.mutate()}
                disabled={validateMutation.isPending}
              >
                {validateMutation.isPending ? 'Validating…' : 'Validate plan'}
              </Button>
              {editable ? (
                <Button
                  className='h-10 gap-1.5 px-3 text-[13px]! font-semibold'
                  onClick={() => activateMutation.mutate()}
                  disabled={
                    activateMutation.isPending ||
                    !hasValidated ||
                    validationIssues.length > 0
                  }
                >
                  <CheckCircle2Icon className='size-3.5' />
                  {activateMutation.isPending ? 'Activating…' : 'Activate plan'}
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
