'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parse, startOfDay } from 'date-fns';
import {
  ActivityIcon,
  AlertTriangleIcon,
  AppleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  DumbbellIcon,
  FileTextIcon,
  FootprintsIcon,
  HeartPulseIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
  XCircleIcon,
} from 'lucide-react';
import * as React from 'react';
import { type ComponentType } from 'react';
import { toast } from 'sonner';

import ComboboxField, {
  type ComboboxOption,
} from '@/components/shared/form/ComboBoxField';
import DatePickerField from '@/components/shared/form/DatePickerField';
import TextAreaField from '@/components/shared/form/TextAreaField';
import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints/lookup';
import { ROUTES } from '@/config/routes';
import {
  getCarePlanBuilderById,
  patchCarePlanBasics,
  postCarePlanGenerateDays,
  postCarePlanRevision,
  putCarePlanSectionItems,
} from '@/domains/care-plans/services';
import type {
  CarePlanSectionItem,
  CarePlanSectionKey,
  CarePlanStatus,
} from '@/domains/care-plans/types/admin';
import { getUnitsLookup } from '@/domains/units/services';
import { http } from '@/lib/api/client';

const SECTIONS: ReadonlyArray<{
  key: CarePlanSectionKey;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { key: 'nutrition', label: 'Nutrition', icon: AppleIcon },
  { key: 'movement', label: 'Movement', icon: DumbbellIcon },
  { key: 'activity', label: 'Activity', icon: FootprintsIcon },
  { key: 'recovery', label: 'Recovery', icon: HeartPulseIcon },
];

const SECTION_GUIDANCE: Record<CarePlanSectionKey, string> = {
  nutrition:
    'Document what the client should eat or drink for this day: meal timing, portions, and simple instructions they can follow at home. This plan is written for the enrolled client, as directed by their doctor.',
  movement:
    'List the movement work the client should complete: choose each exercise and, where helpful, sets, reps, and rest so the client knows exactly what to do and can track progress.',
  activity:
    'Add everyday activities the client should aim for (walking, stretching, errands, etc.) with a clear target and simple wording they can follow on their own.',
  recovery:
    'Describe rest, wind-down, and recovery habits for the client, including sleep windows, light mobility, breathing, or relaxation, so they can recover well between harder days.',
};

const STATUS_LABEL: Record<CarePlanStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const CARE_PLAN_STATUS_STYLES: Record<
  CarePlanStatus,
  { icon: ComponentType<{ className?: string }>; className: string }
> = {
  draft: {
    icon: FileTextIcon,
    className:
      'border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  },
  active: {
    icon: ActivityIcon,
    className:
      'border-indigo-300/80 bg-indigo-50 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200',
  },
  completed: {
    icon: CheckCircle2Icon,
    className:
      'border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  },
  cancelled: {
    icon: XCircleIcon,
    className:
      'border-rose-300/80 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
  },
};

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

function normalizeStatus(
  raw: string | null | undefined,
): CarePlanStatus | null {
  const status = (raw ?? '').trim().toLowerCase();
  if (
    status === 'draft' ||
    status === 'active' ||
    status === 'completed' ||
    status === 'cancelled'
  ) {
    return status;
  }
  return null;
}

function parseYmdLocal(ymd: string): Date | undefined {
  if (!ymd?.trim()) return undefined;
  const d = parse(ymd.trim(), 'yyyy-MM-dd', new Date());
  return Number.isNaN(d.getTime()) ? undefined : startOfDay(d);
}

function formatTargetDateLabel(ymd: string | null | undefined): string {
  if (!ymd?.trim()) return 'Date not set';
  const parsed = parse(ymd.trim(), 'yyyy-MM-dd', new Date());
  if (Number.isNaN(parsed.getTime())) return ymd.trim();
  return format(parsed, 'EEE, dd-MMM-yyyy');
}

function toEditableSectionItems(
  items: CarePlanSectionItem[],
): CarePlanSectionItem[] {
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
      typeof item.target_value === 'number' ||
      typeof item.target_value === 'string'
        ? item.target_value
        : '',
    target_unit: typeof item.target_unit === 'string' ? item.target_unit : '',
    movement_exercise_id:
      typeof item.movement_exercise_id === 'number' ||
      typeof item.movement_exercise_id === 'string'
        ? item.movement_exercise_id
        : typeof item.exercise_id === 'number' ||
            typeof item.exercise_id === 'string'
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

function createEmptySectionItem(): CarePlanSectionItem {
  return {
    title: '',
    guidance: '',
    target_value: '',
    target_unit: '',
    movement_exercise_id: '',
    exercises: [],
  };
}

function createEmptyMovementExercise() {
  return {
    movement_exercise_id: '',
    sets: null,
    reps: null,
    rest_seconds: null,
  };
}

type MovementExerciseInput = {
  movement_exercise_id: string;
  sets: string;
  reps: string;
  rest_seconds: string;
};
type MovementExerciseSource = {
  movement_exercise_id?: string | number | null;
  sets?: string | number | null;
  reps?: string | number | null;
  rest_seconds?: string | number | null;
};

type NormalizedSectionItem = {
  title: string;
  guidance: string;
  target_value: string;
  target_unit: string;
  movement_exercise_id: string;
  exercises: MovementExerciseInput[];
};

function normalizeValue(value: unknown): string {
  if (value == null) return '';
  return String(value).trim();
}

function normalizeMovementExercise(
  exercise: MovementExerciseSource | undefined,
): MovementExerciseInput {
  return {
    movement_exercise_id: normalizeValue(exercise?.movement_exercise_id),
    sets: normalizeValue(exercise?.sets),
    reps: normalizeValue(exercise?.reps),
    rest_seconds: normalizeValue(exercise?.rest_seconds),
  };
}

function isMovementExerciseMeaningful(
  exercise: MovementExerciseInput,
): boolean {
  return Boolean(
    exercise.movement_exercise_id ||
    exercise.sets ||
    exercise.reps ||
    exercise.rest_seconds,
  );
}

function normalizeSectionItemsForSave(
  items: CarePlanSectionItem[],
  section: CarePlanSectionKey,
): NormalizedSectionItem[] {
  return items
    .map((item) => {
      const title = normalizeValue(item?.title);
      const guidance = normalizeValue(item?.guidance);
      const targetValue = normalizeValue(item?.target_value);
      const targetUnit = normalizeValue(item?.target_unit);
      const exercises = Array.isArray(item?.exercises)
        ? item.exercises.map((exercise) => normalizeMovementExercise(exercise))
        : [];
      const meaningfulExercises =
        section === 'movement'
          ? exercises.filter(isMovementExerciseMeaningful)
          : [];
      const movementExerciseId =
        meaningfulExercises.length > 0
          ? meaningfulExercises[0].movement_exercise_id
          : normalizeValue(item?.movement_exercise_id || item?.exercise_id);

      return {
        title,
        guidance,
        target_value: targetValue,
        target_unit: targetUnit,
        movement_exercise_id: movementExerciseId,
        exercises: meaningfulExercises,
      } satisfies NormalizedSectionItem;
    })
    .filter((item) => {
      if (section === 'movement') {
        return Boolean(
          item.title ||
          item.guidance ||
          item.target_value ||
          item.target_unit ||
          item.exercises.length > 0 ||
          item.movement_exercise_id,
        );
      }

      return Boolean(
        item.title || item.guidance || item.target_value || item.target_unit,
      );
    });
}

function toSectionSavePayload(
  items: NormalizedSectionItem[],
): CarePlanSectionItem[] {
  return items.map((item) => ({
    title: item.title,
    guidance: item.guidance,
    target_value: item.target_value,
    target_unit: item.target_unit,
    movement_exercise_id: item.movement_exercise_id,
    exercises: item.exercises.map((exercise) => ({
      movement_exercise_id: exercise.movement_exercise_id,
      sets: exercise.sets === '' ? null : exercise.sets,
      reps: exercise.reps === '' ? null : exercise.reps,
      rest_seconds: exercise.rest_seconds === '' ? null : exercise.rest_seconds,
    })),
  }));
}

function areNormalizedItemsEqual(
  a: NormalizedSectionItem[],
  b: NormalizedSectionItem[],
): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

type CarePlanItemFieldErrors = {
  title?: string;
  guidance?: string;
  target_value?: string;
  target_unit?: string;
};

type CarePlanItemFieldErrorsState = Record<number, CarePlanItemFieldErrors>;

type CarePlanMovementRowErrors = {
  exercise?: string;
  sets?: string;
  reps?: string;
  rest_seconds?: string;
};

type CarePlanMovementRowErrorsState = Record<string, CarePlanMovementRowErrors>;

function firstApiValidationMessage(raw: unknown): string | undefined {
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (typeof entry === 'string' && entry.trim()) return entry.trim();
    }
  }
  return undefined;
}

function parseCarePlanSectionItemsApiErrors(
  errors: Record<string, unknown> | undefined,
): {
  itemFields: CarePlanItemFieldErrorsState;
  movementRows: CarePlanMovementRowErrorsState;
  section?: string;
  itemsRoot?: string;
} {
  const itemFields: CarePlanItemFieldErrorsState = {};
  const movementRows: CarePlanMovementRowErrorsState = {};
  let section: string | undefined;
  let itemsRoot: string | undefined;

  if (!errors) return { itemFields, movementRows };

  for (const [key, raw] of Object.entries(errors)) {
    const msg = firstApiValidationMessage(raw);
    if (!msg) continue;

    if (key === 'section') {
      section = msg;
      continue;
    }
    if (key === 'items') {
      itemsRoot = msg;
      continue;
    }

    const titleM = /^items\.(\d+)\.title$/i.exec(key);
    if (titleM) {
      const i = Number(titleM[1]);
      itemFields[i] = { ...itemFields[i], title: msg };
      continue;
    }

    const guidanceM = /^items\.(\d+)\.guidance$/i.exec(key);
    if (guidanceM) {
      const i = Number(guidanceM[1]);
      itemFields[i] = { ...itemFields[i], guidance: msg };
      continue;
    }

    const tvM = /^items\.(\d+)\.target_value$/i.exec(key);
    if (tvM) {
      const i = Number(tvM[1]);
      itemFields[i] = { ...itemFields[i], target_value: msg };
      continue;
    }

    const tuM = /^items\.(\d+)\.(target_unit|target_unit_id)$/i.exec(key);
    if (tuM) {
      const i = Number(tuM[1]);
      itemFields[i] = { ...itemFields[i], target_unit: msg };
      continue;
    }

    const exM =
      /^items\.(\d+)\.exercises\.(\d+)\.(movement_exercise_id|sets|reps|rest_seconds)$/i.exec(
        key,
      );
    if (exM) {
      const i = Number(exM[1]);
      const j = Number(exM[2]);
      const apiField = exM[3].toLowerCase();
      const rowKey = `${i}-${j}`;
      const uiField: keyof CarePlanMovementRowErrors =
        apiField === 'movement_exercise_id'
          ? 'exercise'
          : (apiField as 'sets' | 'reps' | 'rest_seconds');
      movementRows[rowKey] = {
        ...movementRows[rowKey],
        [uiField]: msg,
      };
    }
  }

  return { itemFields, movementRows, section, itemsRoot };
}

function hasCarePlanSectionItemsFieldErrors(parsed: {
  itemFields: CarePlanItemFieldErrorsState;
  movementRows: CarePlanMovementRowErrorsState;
  section?: string;
  itemsRoot?: string;
}): boolean {
  if (parsed.section?.trim()) return true;
  if (parsed.itemsRoot?.trim()) return true;
  if (Object.keys(parsed.itemFields).length > 0) return true;
  if (Object.keys(parsed.movementRows).length > 0) return true;
  return false;
}

class CarePlanSectionItemsValidationError extends Error {
  readonly parsed: {
    itemFields: CarePlanItemFieldErrorsState;
    movementRows: CarePlanMovementRowErrorsState;
    section?: string;
    itemsRoot?: string;
  };

  constructor(
    message: string,
    parsed: CarePlanSectionItemsValidationError['parsed'],
  ) {
    super(message);
    this.name = 'CarePlanSectionItemsValidationError';
    this.parsed = parsed;
  }
}

export default function CarePlanBuilder({
  carePlanId,
  mode,
}: CarePlanBuilderProps) {
  const queryClient = useQueryClient();
  const isDetailMode = mode === 'detail';
  const [selectedDayId, setSelectedDayId] = React.useState<number | null>(null);
  const [activeSection, setActiveSection] =
    React.useState<CarePlanSectionKey>('nutrition');

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
  const [itemFieldErrors, setItemFieldErrors] =
    React.useState<CarePlanItemFieldErrorsState>({});
  const [movementRowErrors, setMovementRowErrors] =
    React.useState<CarePlanMovementRowErrorsState>({});

  const builderQuery = useQuery({
    queryKey: ['care-plan', carePlanId, 'builder'],
    queryFn: async () => {
      const response = await getCarePlanBuilderById(carePlanId);
      if (response.status === 'error') {
        throw new Error(
          response.message ?? 'Could not load care plan builder.',
        );
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
  const statusStyle = normalizedStatus
    ? CARE_PLAN_STATUS_STYLES[normalizedStatus]
    : null;
  const StatusIcon = statusStyle?.icon;

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
  const activeSectionIndex = React.useMemo(
    () => SECTIONS.findIndex((section) => section.key === activeSection),
    [activeSection],
  );
  const selectedDayIndex = React.useMemo(
    () => builder?.days.findIndex((day) => day.id === selectedDayId) ?? -1,
    [builder?.days, selectedDayId],
  );
  const canGoBack =
    selectedDayIndex > 0 || (selectedDayIndex === 0 && activeSectionIndex > 0);
  const isLastSection = activeSectionIndex === SECTIONS.length - 1;
  const isLastDay =
    selectedDayIndex >= 0 &&
    selectedDayIndex === (builder?.days.length ?? 1) - 1;

  const sectionItems = React.useMemo(
    () =>
      selectedDay
        ? toEditableSectionItems(selectedDay.sections[activeSection] ?? [])
        : [],
    [selectedDay, activeSection],
  );
  const normalizedSectionItems = React.useMemo(
    () => normalizeSectionItemsForSave(sectionItems, activeSection),
    [sectionItems, activeSection],
  );

  const [localItems, setLocalItems] = React.useState<CarePlanSectionItem[]>([]);
  React.useEffect(() => {
    if (activeSection === 'movement') {
      if (sectionItems.length === 0) {
        const baseItem = createEmptySectionItem();
        setLocalItems(
          editable
            ? [{ ...baseItem, exercises: [createEmptyMovementExercise()] }]
            : [],
        );
        return;
      }
      const firstMovementItem = sectionItems[0];
      setLocalItems([
        {
          ...firstMovementItem,
          exercises:
            editable &&
            (!Array.isArray(firstMovementItem.exercises) ||
              firstMovementItem.exercises.length === 0)
              ? [createEmptyMovementExercise()]
              : (firstMovementItem.exercises ?? []),
        },
      ]);
      return;
    }
    if (editable && sectionItems.length === 0) {
      setLocalItems([createEmptySectionItem()]);
      return;
    }
    setLocalItems(sectionItems);
  }, [activeSection, editable, sectionItems]);

  React.useEffect(() => {
    setSectionSaveError(undefined);
    setItemFieldErrors({});
    setMovementRowErrors({});
  }, [selectedDayId, activeSection]);

  const clearItemFieldError = React.useCallback(
    (index: number, field: keyof CarePlanItemFieldErrors) => {
      setItemFieldErrors((prev) => {
        const cur = prev[index];
        if (!cur?.[field]) return prev;
        const nextItem = { ...cur };
        delete nextItem[field];
        const next = { ...prev };
        if (Object.keys(nextItem).length === 0) delete next[index];
        else next[index] = nextItem;
        return next;
      });
    },
    [],
  );

  const clearMovementRowField = React.useCallback(
    (
      itemIndex: number,
      exerciseIndex: number,
      field: keyof CarePlanMovementRowErrors,
    ) => {
      const k = `${itemIndex}-${exerciseIndex}`;
      setMovementRowErrors((prev) => {
        const cur = prev[k];
        if (!cur?.[field]) return prev;
        const nextRow = { ...cur };
        delete nextRow[field];
        const next = { ...prev };
        if (Object.keys(nextRow).length === 0) delete next[k];
        else next[k] = nextRow;
        return next;
      });
    },
    [],
  );

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
      toast.success('The care plan basics have been saved successfully.');
      invalidateBuilder();
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Could not update plan basics.');
    },
  });

  const validateBasicsDates = (): boolean => {
    const next: { starts_on?: string; ends_on?: string } = {};
    if (!basicsForm.starts_on.trim()) {
      next.starts_on = 'The start date field is required.';
    }
    if (!basicsForm.ends_on.trim()) {
      next.ends_on = 'The end date field is required.';
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
    mutationFn: async (payload: {
      dayId: number;
      items: CarePlanSectionItem[];
    }) => {
      const response = await putCarePlanSectionItems(
        carePlanId,
        payload.dayId,
        activeSection,
        payload.items,
      );
      if (response.status === 'error') {
        const parsed = parseCarePlanSectionItemsApiErrors(response.errors);
        if (hasCarePlanSectionItemsFieldErrors(parsed)) {
          throw new CarePlanSectionItemsValidationError(
            response.message ?? 'Please fix the highlighted fields.',
            parsed,
          );
        }
        throw new Error(response.message ?? 'Could not save section items.');
      }
      return response.data;
    },
    onSuccess: () => {
      setItemFieldErrors({});
      setMovementRowErrors({});
      setSectionSaveError(undefined);
      toast.success(
        `${SECTIONS.find((x) => x.key === activeSection)?.label} section saved.`,
      );
      invalidateBuilder();
    },
    onError: (error: Error) => {
      if (error instanceof CarePlanSectionItemsValidationError) {
        setItemFieldErrors(error.parsed.itemFields);
        setMovementRowErrors(error.parsed.movementRows);
        setSectionSaveError(
          error.parsed.section ?? error.parsed.itemsRoot ?? undefined,
        );
        return;
      }
      toast.error(error.message ?? 'Could not save section items.');
    },
  });

  const validateSectionBeforeSave = (): number | null => {
    setSectionSaveError(undefined);
    setItemFieldErrors({});
    setMovementRowErrors({});

    if (!selectedDay) {
      setSectionSaveError('Please select a day first.');
      return null;
    }

    const itemFieldErrs: CarePlanItemFieldErrorsState = {};
    const movementRowErrs: CarePlanMovementRowErrorsState = {};

    const normalizedLocalItems = normalizeSectionItemsForSave(
      localItems,
      activeSection,
    );

    for (let i = 0; i < normalizedLocalItems.length; i++) {
      const item = normalizedLocalItems[i];
      if (!item.title) {
        itemFieldErrs[i] = {
          ...itemFieldErrs[i],
          title: 'The title field is required.',
        };
      }

      if (activeSection === 'movement') {
        const exercises = Array.isArray(item?.exercises) ? item.exercises : [];
        if (exercises.length === 0) {
          movementRowErrs[`${i}-0`] = {
            ...movementRowErrs[`${i}-0`],
            exercise: 'Please select an exercise for this row.',
          };
        } else {
          for (let j = 0; j < exercises.length; j++) {
            if (
              String(exercises[j]?.movement_exercise_id ?? '').trim().length ===
              0
            ) {
              movementRowErrs[`${i}-${j}`] = {
                ...movementRowErrs[`${i}-${j}`],
                exercise: 'Please select an exercise for this row.',
              };
            }
          }
        }
      } else {
        const val = String(item?.target_value ?? '').trim();
        const unit = String(item?.target_unit ?? '').trim();
        if (val && !unit) {
          itemFieldErrs[i] = {
            ...itemFieldErrs[i],
            target_unit: 'Select a unit when a target value is set.',
          };
        }
      }
    }

    if (Object.keys(itemFieldErrs).length > 0) {
      setItemFieldErrors(itemFieldErrs);
    }
    if (Object.keys(movementRowErrs).length > 0) {
      setMovementRowErrors(movementRowErrs);
    }
    if (
      Object.keys(itemFieldErrs).length > 0 ||
      Object.keys(movementRowErrs).length > 0
    ) {
      return null;
    }

    return selectedDay.id;
  };

  const moveToNextStep = () => {
    if (!builder || selectedDayIndex < 0 || activeSectionIndex < 0) return;
    if (activeSectionIndex < SECTIONS.length - 1) {
      setActiveSection(SECTIONS[activeSectionIndex + 1].key);
      return;
    }
    if (selectedDayIndex < builder.days.length - 1) {
      setSelectedDayId(builder.days[selectedDayIndex + 1].id);
      setActiveSection(SECTIONS[0].key);
      return;
    }
    toast.success('All daily sections are completed and saved.');
  };

  const moveToPreviousStep = () => {
    if (!builder || selectedDayIndex < 0 || activeSectionIndex < 0) return;
    if (activeSectionIndex > 0) {
      setActiveSection(SECTIONS[activeSectionIndex - 1].key);
      return;
    }
    if (selectedDayIndex > 0) {
      setSelectedDayId(builder.days[selectedDayIndex - 1].id);
      setActiveSection(SECTIONS[SECTIONS.length - 1].key);
    }
  };

  const handleSaveSection = async (moveForward = false) => {
    const dayId = validateSectionBeforeSave();
    if (!dayId) return;
    const normalizedLocalItems = normalizeSectionItemsForSave(
      localItems,
      activeSection,
    );
    const skipSave =
      normalizedLocalItems.length === 0 ||
      areNormalizedItemsEqual(normalizedLocalItems, normalizedSectionItems);

    if (!skipSave) {
      await sectionSaveMutation.mutateAsync({
        dayId,
        items: toSectionSavePayload(normalizedLocalItems),
      });
    }

    if (moveForward) moveToNextStep();
  };

  const revisionMutation = useMutation({
    mutationFn: async () => {
      const response = await postCarePlanRevision(carePlanId);
      if (response.status === 'error') {
        throw new Error(
          response.message ?? 'Could not create care plan revision.',
        );
      }
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Care plan revision created.');
      if (data?.id != null) {
        window.location.href = ROUTES.ADMIN.MODULES.CARE_PLANS.BUILDER(
          String(data.id),
        );
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
    if (field === 'title') clearItemFieldError(index, 'title');
    if (field === 'guidance') clearItemFieldError(index, 'guidance');
    if (field === 'target_value') clearItemFieldError(index, 'target_value');
    if (field === 'target_unit') clearItemFieldError(index, 'target_unit');
  };

  const setMovementExerciseField = (
    itemIndex: number,
    exerciseIndex: number,
    field: 'sets' | 'reps' | 'rest_seconds',
    value: string,
  ) => {
    setLocalItems((prev) =>
      prev.map((entry, idx) => {
        if (idx !== itemIndex) return entry;
        const existing = Array.isArray(entry.exercises) ? entry.exercises : [];
        return {
          ...entry,
          exercises: existing.map((exercise, idx) =>
            idx === exerciseIndex
              ? {
                  ...exercise,
                  [field]: value.trim() === '' ? null : value,
                }
              : exercise,
          ),
        };
      }),
    );
    clearMovementRowField(itemIndex, exerciseIndex, field);
  };

  const setMovementExerciseSelection = (
    itemIndex: number,
    exerciseIndex: number,
    value: string,
  ) => {
    setLocalItems((prev) =>
      prev.map((entry, idx) => {
        if (idx !== itemIndex) return entry;
        const existing = Array.isArray(entry.exercises) ? entry.exercises : [];
        const nextExercises = existing.map((exercise, idx) =>
          idx === exerciseIndex
            ? {
                ...exercise,
                movement_exercise_id: value,
              }
            : exercise,
        );
        const nextPrimaryExerciseId =
          nextExercises.length > 0
            ? String(nextExercises[0].movement_exercise_id ?? '').trim()
            : '';
        return {
          ...entry,
          exercises: nextExercises,
          movement_exercise_id: nextPrimaryExerciseId,
          exercise_id: nextPrimaryExerciseId,
        };
      }),
    );
    clearMovementRowField(itemIndex, exerciseIndex, 'exercise');
  };

  const addMovementExerciseRow = (itemIndex: number) => {
    setLocalItems((prev) =>
      prev.map((entry, idx) =>
        idx === itemIndex
          ? {
              ...entry,
              exercises: [
                ...(Array.isArray(entry.exercises) ? entry.exercises : []),
                createEmptyMovementExercise(),
              ],
            }
          : entry,
      ),
    );
  };

  const removeMovementExerciseRow = (
    itemIndex: number,
    exerciseIndex: number,
  ) => {
    setLocalItems((prev) =>
      prev.map((entry, idx) => {
        if (idx !== itemIndex) return entry;
        const existing = Array.isArray(entry.exercises) ? entry.exercises : [];
        const nextExercises =
          existing.length <= 1
            ? existing
            : existing.filter((_, idx) => idx !== exerciseIndex);
        const nextPrimaryExerciseId =
          nextExercises.length > 0
            ? String(nextExercises[0].movement_exercise_id ?? '').trim()
            : '';
        return {
          ...entry,
          exercises: nextExercises,
          movement_exercise_id: nextPrimaryExerciseId,
          exercise_id: nextPrimaryExerciseId,
        };
      }),
    );
  };

  const startDateForBasics = parseYmdLocal(basicsForm.starts_on);
  const basicsEndCalendarDisabled = startDateForBasics
    ? { before: startDateForBasics }
    : undefined;

  const addItem = () => {
    if (activeSection === 'movement') return;
    setLocalItems((prev) => [...prev, createEmptySectionItem()]);
  };

  const removeItem = (index: number) => {
    setLocalItems((prev) => {
      if (activeSection === 'movement') return prev;
      if (prev.length <= 1) return prev;
      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  if (builderQuery.isPending) {
    return (
      <div className='text-muted-foreground text-sm'>
        Loading care plan builder...
      </div>
    );
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
      <section className='border-border max-w-full min-w-0 space-y-5 rounded-md border bg-white p-4 shadow-xs sm:p-5 lg:p-6'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div className='space-y-1.5'>
            <p className='text-muted-foreground text-[10px] font-semibold tracking-wide uppercase'>
              Care Plan Reference
            </p>
            <p className='text-foreground/90 text-[13px] leading-relaxed font-semibold'>
              {builder.code?.trim() || `Care Plan #${builder.id}`}
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            {statusStyle && StatusIcon && normalizedStatus ? (
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${statusStyle.className}`}
              >
                <StatusIcon className='size-3.5' />
                {STATUS_LABEL[normalizedStatus]}
              </span>
            ) : (
              <span className='inline-flex items-center rounded-full border border-neutral-300 bg-neutral-50 px-2 py-1 text-[11px] font-semibold text-neutral-700'>
                {builder.status || 'Unknown'}
              </span>
            )}
            <span className='inline-flex items-center rounded-full border border-neutral-300 bg-neutral-50 px-2 py-1 text-[11px] font-semibold text-neutral-700'>
              Cycle {builder.cycle_number ?? '—'}
            </span>
          </div>
        </div>

        {!editable ? (
          <div className='flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs text-amber-900'>
            <AlertTriangleIcon className='mt-0.5 size-3.5 shrink-0' />
            <div className='space-y-1'>
              <p className='font-semibold'>
                This care plan is read-only because its current status is{' '}
                {builder.status}.
              </p>
              {!isDetailMode ? (
                <Button
                  size='sm'
                  className='h-8 px-3 text-xs font-semibold'
                  disabled={revisionMutation.isPending}
                  onClick={() => revisionMutation.mutate()}
                >
                  {revisionMutation.isPending
                    ? 'Creating revision…'
                    : 'Create revision'}
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className='border-border border-t pt-4'>
          <div className='space-y-4'>
            <div className='space-y-1.5'>
              <p className='text-foreground text-sm font-bold'>
                Care Plan Basics
              </p>
              <p className='text-muted-foreground text-[13px] font-medium'>
                Specify the mandatory start and end dates for this care plan and
                configure auto-generation preferences. Completing this setup is
                required before proceeding to day-by-day plan building.
              </p>
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

            <label className='text-foreground/90 flex items-center gap-2.5 text-[13px] font-medium'>
              <Switch
                className='h-5 w-9 shrink-0 **:data-[slot=switch-thumb]:size-4 **:data-[slot=switch-thumb]:data-[state=checked]:translate-x-4'
                checked={generateForm.replace_existing}
                onCheckedChange={(checked) =>
                  setGenerateForm((prev) => ({
                    ...prev,
                    replace_existing: checked === true,
                  }))
                }
                disabled={!editable || generateMutation.isPending}
              />
              <span>Overwrite existing days during day generation</span>
            </label>

            {editable ? (
              <div className='flex flex-wrap justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={handleSaveBasics}
                  disabled={basicsMutation.isPending}
                  className='text-foreground bg-background hover:bg-muted h-10 shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
                >
                  <SaveIcon className='size-3.5' />
                  {basicsMutation.isPending ? 'Saving…' : 'Save Plan Basics'}
                </Button>
                <Button
                  onClick={handleGenerateDays}
                  disabled={generateMutation.isPending}
                  className='h-10 shrink-0 gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
                >
                  {generateMutation.isPending ? (
                    <>
                      <SaveIcon className='size-3.5 animate-spin' />
                      Generating days…
                    </>
                  ) : (
                    <>
                      <ArrowRightIcon className='size-3.5' />
                      Continue to Plan Tasks
                    </>
                  )}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className='border-border max-w-full min-w-0 space-y-5 rounded-md border bg-white p-4 shadow-xs sm:p-5 lg:p-6'>
        <div className='mb-4 flex flex-wrap items-start justify-between gap-3'>
          <div className='space-y-1.5'>
            <p className='text-foreground text-sm font-bold'>
              Plan Task Configuration
            </p>
            <p className='text-muted-foreground text-[13px] font-medium'>
              Define each day&apos;s tasks for the enrolled client in nutrition,
              movement, activity, and recovery, as clear instructions from their
              doctor. Work section by section and continue when each part is
              saved.
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
            Complete setup and click{' '}
            <span className='font-semibold'>Continue to builder</span> to
            generate days.
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
              <div className='border-border bg-background overflow-hidden rounded-md border shadow-xs lg:col-span-3'>
                <div className='border-border bg-muted/40 border-b p-3 text-[13px] font-semibold capitalize'>
                  Days Schedule
                </div>
                <div className='space-y-1 p-2'>
                  {builder.days.length === 0 ? (
                    <p className='text-muted-foreground p-2 text-sm'>
                      No days generated yet.
                    </p>
                  ) : (
                    builder.days.map((day) => (
                      <button
                        key={day.id}
                        type='button'
                        className={`w-full rounded-md px-2.5 py-2 text-left transition-colors ${
                          selectedDayId === day.id
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'text-foreground hover:bg-muted'
                        }`}
                        onClick={() => setSelectedDayId(day.id)}
                      >
                        <span className='block text-[13px] font-semibold'>
                          Day {day.day_number}
                        </span>
                        <span
                          className={`block text-[11px] font-medium ${
                            selectedDayId === day.id
                              ? 'text-primary-foreground/80'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {formatTargetDateLabel(day.target_date)}
                        </span>
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
                    onValueChange={(value) =>
                      setActiveSection(value as CarePlanSectionKey)
                    }
                  >
                    <TabsList
                      variant='line'
                      className='bg-muted! border-border w-full border'
                    >
                      {SECTIONS.map((section) => (
                        <TabsTrigger
                          key={section.key}
                          value={section.key}
                          className='flex-1 gap-1.5 text-[13px] font-semibold'
                        >
                          <section.icon className='size-3.5 shrink-0' />
                          {section.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <p className='text-muted-foreground my-1.5 text-[13px] font-medium'>
                      {SECTION_GUIDANCE[activeSection]}
                    </p>

                    {SECTIONS.map((section) => (
                      <TabsContent
                        key={section.key}
                        value={section.key}
                        className='space-y-4'
                      >
                        {localItems.length === 0 ? (
                          <p className='text-muted-foreground text-sm'>
                            There are currently no items in this section.
                          </p>
                        ) : null}

                        {localItems.map((item, index) => (
                          <div
                            key={`${index}-${item.id ?? 'new'}`}
                            className='border-border/80 rounded-md border p-4 md:p-5'
                          >
                            <div className='space-y-4'>
                              <div className='grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] sm:items-start'>
                                <TextField
                                  label='Task Title'
                                  placeholder={
                                    activeSection === 'nutrition'
                                      ? 'e.g. Breakfast'
                                      : activeSection === 'movement'
                                        ? 'e.g. Mobility routine'
                                        : activeSection === 'activity'
                                          ? 'e.g. Morning walk'
                                          : 'e.g. Evening wind-down'
                                  }
                                  value={String(item.title ?? '')}
                                  onChange={(event) =>
                                    setItemField(
                                      index,
                                      'title',
                                      event.target.value,
                                    )
                                  }
                                  error={itemFieldErrors[index]?.title}
                                  disabled={!editable}
                                />
                                {editable && activeSection !== 'movement' ? (
                                  <Button
                                    type='button'
                                    variant='outline'
                                    size='icon'
                                    className='text-foreground bg-background hover:bg-muted mt-7 h-11 w-11 shrink-0 border-neutral-300'
                                    onClick={() => removeItem(index)}
                                    aria-label='Remove item'
                                  >
                                    <Trash2Icon className='size-4' />
                                  </Button>
                                ) : null}
                              </div>
                              <TextAreaField
                                label='Guidance'
                                rows={3}
                                placeholder='Write step-by-step directions the client can follow on their own.'
                                value={String(item.guidance ?? '')}
                                onChange={(event) =>
                                  setItemField(
                                    index,
                                    'guidance',
                                    event.target.value,
                                  )
                                }
                                error={itemFieldErrors[index]?.guidance}
                                disabled={!editable}
                              />
                              {activeSection === 'movement' ? (
                                <>
                                  <div className='space-y-3'>
                                    {(item.exercises ?? []).map(
                                      (exercise, exerciseIndex) => {
                                        const exerciseId = String(
                                          exercise.movement_exercise_id ?? '',
                                        ).trim();
                                        return (
                                          <div
                                            key={`${exerciseId || 'new'}-${exerciseIndex}`}
                                            className='border-border space-y-3 rounded-md border p-5'
                                          >
                                            <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                                              <div className='min-w-0 flex-1'>
                                                <ComboboxField
                                                  label='Movement Exercise'
                                                  placeholder='Select exercise…'
                                                  searchPlaceholder='Search exercise…'
                                                  emptyMessage='No exercises found.'
                                                  options={
                                                    movementExerciseOptions
                                                  }
                                                  value={exerciseId || null}
                                                  onChange={(value) =>
                                                    setMovementExerciseSelection(
                                                      index,
                                                      exerciseIndex,
                                                      value ?? '',
                                                    )
                                                  }
                                                  error={
                                                    movementRowErrors[
                                                      `${index}-${exerciseIndex}`
                                                    ]?.exercise
                                                  }
                                                  disabled={
                                                    !editable ||
                                                    movementExercisesLookupQuery.isLoading
                                                  }
                                                />
                                              </div>
                                              {editable ? (
                                                <Button
                                                  type='button'
                                                  variant='outline'
                                                  size='icon'
                                                  className='text-foreground bg-background hover:bg-muted h-11 w-11 shrink-0 self-end border-neutral-300 sm:mt-7 sm:self-start'
                                                  onClick={() =>
                                                    removeMovementExerciseRow(
                                                      index,
                                                      exerciseIndex,
                                                    )
                                                  }
                                                  aria-label='Remove exercise row'
                                                >
                                                  <Trash2Icon className='size-4' />
                                                </Button>
                                              ) : null}
                                            </div>

                                            <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3'>
                                              <TextField
                                                label='Sets'
                                                type='number'
                                                min={1}
                                                max={1000}
                                                placeholder='e.g. 3'
                                                value={String(
                                                  exercise.sets ?? '',
                                                )}
                                                onChange={(event) =>
                                                  setMovementExerciseField(
                                                    index,
                                                    exerciseIndex,
                                                    'sets',
                                                    event.target.value,
                                                  )
                                                }
                                                error={
                                                  movementRowErrors[
                                                    `${index}-${exerciseIndex}`
                                                  ]?.sets
                                                }
                                                disabled={!editable}
                                              />
                                              <TextField
                                                label='Reps'
                                                type='number'
                                                min={1}
                                                max={1000}
                                                placeholder='e.g. 12'
                                                value={String(
                                                  exercise.reps ?? '',
                                                )}
                                                onChange={(event) =>
                                                  setMovementExerciseField(
                                                    index,
                                                    exerciseIndex,
                                                    'reps',
                                                    event.target.value,
                                                  )
                                                }
                                                error={
                                                  movementRowErrors[
                                                    `${index}-${exerciseIndex}`
                                                  ]?.reps
                                                }
                                                disabled={!editable}
                                              />
                                              <TextField
                                                label='Rest (Seconds)'
                                                type='number'
                                                min={0}
                                                max={7200}
                                                placeholder='e.g. 60'
                                                value={String(
                                                  exercise.rest_seconds ?? '',
                                                )}
                                                onChange={(event) =>
                                                  setMovementExerciseField(
                                                    index,
                                                    exerciseIndex,
                                                    'rest_seconds',
                                                    event.target.value,
                                                  )
                                                }
                                                error={
                                                  movementRowErrors[
                                                    `${index}-${exerciseIndex}`
                                                  ]?.rest_seconds
                                                }
                                                disabled={!editable}
                                              />
                                            </div>
                                          </div>
                                        );
                                      },
                                    )}
                                    {editable ? (
                                      <div className='pt-1'>
                                        <div className='flex justify-end'>
                                          <Button
                                            type='button'
                                            variant='outline'
                                            className='text-foreground bg-background hover:bg-muted h-9 gap-1.5 border-neutral-300 px-2.5 text-[12px]! font-semibold'
                                            onClick={() =>
                                              addMovementExerciseRow(index)
                                            }
                                          >
                                            <PlusIcon className='size-3.5' />
                                            Add Exercise
                                          </Button>
                                        </div>
                                      </div>
                                    ) : null}
                                  </div>
                                </>
                              ) : (
                                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                                  <TextField
                                    label='Target Value'
                                    placeholder='e.g. 30'
                                    value={String(item.target_value ?? '')}
                                    onChange={(event) =>
                                      setItemField(
                                        index,
                                        'target_value',
                                        event.target.value,
                                      )
                                    }
                                    error={itemFieldErrors[index]?.target_value}
                                    disabled={!editable}
                                  />
                                  <ComboboxField
                                    label='Target Unit'
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
                                      setItemField(
                                        index,
                                        'target_unit',
                                        value ?? '',
                                      )
                                    }
                                    error={itemFieldErrors[index]?.target_unit}
                                    disabled={!editable}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {editable ? (
                          <div className='border-border/70 space-y-3 border-t pt-4'>
                            {sectionSaveError ? (
                              <p className='text-destructive text-[13px] font-medium'>
                                {sectionSaveError}
                              </p>
                            ) : null}
                            <div className='flex flex-wrap items-center justify-between gap-3'>
                              <div className='flex flex-wrap items-center gap-2'>
                                {activeSection !== 'movement' ? (
                                  <Button
                                    type='button'
                                    variant='outline'
                                    className='text-foreground bg-background hover:bg-muted h-10 gap-1.5 border-neutral-300 px-3 text-[13px]! font-semibold'
                                    onClick={addItem}
                                  >
                                    <PlusIcon className='size-3.5' />
                                    Add Item
                                  </Button>
                                ) : null}
                              </div>
                              <div className='flex flex-wrap items-center justify-end gap-2'>
                                <Button
                                  type='button'
                                  variant='outline'
                                  className='text-foreground bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
                                  onClick={moveToPreviousStep}
                                  disabled={
                                    !canGoBack || sectionSaveMutation.isPending
                                  }
                                >
                                  <ArrowLeftIcon className='size-3.5' />
                                  Previous
                                </Button>
                                <Button
                                  type='button'
                                  className='h-10 gap-1.5 px-3 text-[13px]! font-semibold'
                                  disabled={sectionSaveMutation.isPending}
                                  onClick={() => void handleSaveSection(true)}
                                >
                                  {sectionSaveMutation.isPending
                                    ? 'Saving…'
                                    : isLastSection
                                      ? isLastDay
                                        ? 'Save & Finish'
                                        : 'Save & Next Day'
                                      : 'Save & Continue'}
                                  <ArrowRightIcon className='size-3.5' />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </TabsContent>
                    ))}
                  </Tabs>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
