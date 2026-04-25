'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addDays, format, parse, startOfDay } from 'date-fns';
import {
  AlertTriangleIcon,
  AppleIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  DumbbellIcon,
  FilePlus2Icon,
  FileTextIcon,
  FootprintsIcon,
  HeartPulseIcon,
  PencilLineIcon,
  PlusIcon,
  RefreshCwIcon,
  Trash2Icon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { type ComponentType } from 'react';
import { toast } from 'sonner';

import CarePlanDayNoteModal from '@/components/admin/modules/care-plans/CarePlanDayNoteModal';
import CarePlanFinalizeConfirmation from '@/components/admin/modules/care-plans/CarePlanFinalizeConfirmation';
import CarePlanGenerateDaysModal from '@/components/admin/modules/care-plans/CarePlanGenerateDaysModal';
import ComboboxField, {
  type ComboboxOption,
} from '@/components/shared/form/ComboBoxField';
import TextAreaField from '@/components/shared/form/TextAreaField';
import TextField from '@/components/shared/form/TextField';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base } from '@/config/api/base';
import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints/lookup';
import { ROUTES } from '@/config/routes';
import {
  getCarePlanBuilderById,
  patchCarePlanDayNotes,
  postCarePlanGenerateDays,
  postCarePlanRevision,
  postCarePlanValidate,
  putCarePlanSectionItems,
} from '@/domains/care-plans/services';
import type {
  CarePlanSectionItem,
  CarePlanSectionKey,
  CarePlanStatus,
  CarePlanValidationIssue,
} from '@/domains/care-plans/types/admin';
import { getUnitsLookup } from '@/domains/units/services';
import { http } from '@/lib/api/client';
import { cn } from '@/lib/utils/styles';

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

const SECTION_ADD_LABEL: Record<CarePlanSectionKey, string> = {
  nutrition: 'Add Nutrition',
  movement: 'Add Movement',
  activity: 'Add Activity',
  recovery: 'Add Recovery',
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
    status === 'scheduled' ||
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

const MAX_START_OFFSET_DAYS = 180;
const MAX_PLAN_DURATION_DAYS = 90;

function formatTargetDateLabel(ymd: string | null | undefined): string {
  if (!ymd?.trim()) return 'Date not set';
  const parsed = parse(ymd.trim(), 'yyyy-MM-dd', new Date());
  if (Number.isNaN(parsed.getTime())) return ymd.trim();
  return format(parsed, 'EEE, dd-MMM-yyyy');
}

function getNameInitials(value: string | null | undefined): string {
  const text = (value ?? '').trim();
  if (!text) return 'NA';
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
}

function resolveClientPictureUrl(
  raw: string | null | undefined,
): string | undefined {
  if (!raw?.trim()) return undefined;
  const v = raw.trim();
  if (v.startsWith('http')) return v;
  return `${base.domainEndpoint}${v}`;
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
    target_unit:
      typeof item.target_unit === 'string'
        ? item.target_unit
        : typeof item.target_unit_id === 'number' ||
            typeof item.target_unit_id === 'string'
          ? String(item.target_unit_id)
          : '',
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

function toNullableInteger(value: string): number | null {
  const normalized = normalizeValue(value);
  if (!normalized) return null;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isNaN(parsed) ? null : parsed;
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
  section: CarePlanSectionKey,
  resolveUnitId?: (value: string) => number | null,
): CarePlanSectionItem[] {
  return items.map((item) => {
    const baseItem: CarePlanSectionItem = {
      title: item.title,
      guidance: item.guidance,
      target_value: item.target_value,
      exercises: item.exercises.map((exercise) => ({
        movement_exercise_id: toNullableInteger(exercise.movement_exercise_id),
        sets: exercise.sets === '' ? null : exercise.sets,
        reps: exercise.reps === '' ? null : exercise.reps,
        rest_seconds:
          exercise.rest_seconds === '' ? null : exercise.rest_seconds,
      })),
    };

    if (section === 'movement') {
      baseItem.movement_exercise_id = toNullableInteger(
        item.movement_exercise_id,
      );
      baseItem.target_unit = item.target_unit;
      return baseItem;
    }

    const resolvedTargetUnitId =
      toNullableInteger(item.target_unit) ??
      resolveUnitId?.(item.target_unit) ??
      null;

    return {
      title: item.title,
      guidance: item.guidance,
      target_value: item.target_value,
      target_unit_id: resolvedTargetUnitId,
    };
  });
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

  const flattenValidationEntries = (
    input: unknown,
    prefix = '',
  ): Array<[string, unknown]> => {
    if (Array.isArray(input)) {
      const isMessageArray = input.every(
        (entry) =>
          entry == null ||
          typeof entry === 'string' ||
          typeof entry === 'number' ||
          typeof entry === 'boolean',
      );
      if (isMessageArray) return prefix ? [[prefix, input]] : [];
      return input.flatMap((entry, idx) =>
        flattenValidationEntries(
          entry,
          prefix ? `${prefix}.${idx}` : String(idx),
        ),
      );
    }
    if (input && typeof input === 'object') {
      return Object.entries(input as Record<string, unknown>).flatMap(
        ([key, value]) =>
          flattenValidationEntries(value, prefix ? `${prefix}.${key}` : key),
      );
    }
    return prefix ? [[prefix, input]] : [];
  };

  for (const [key, raw] of flattenValidationEntries(errors)) {
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

function toLookupToken(value: unknown): string {
  return normalizeValue(value).toLowerCase();
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

class CarePlanDayNotesValidationError extends Error {
  readonly fieldError?: string;

  constructor(message: string, fieldError?: string) {
    super(message);
    this.name = 'CarePlanDayNotesValidationError';
    this.fieldError = fieldError;
  }
}

export default function CarePlanBuilder({
  carePlanId,
  mode,
}: CarePlanBuilderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isDetailMode = mode === 'detail';
  const [selectedDayId, setSelectedDayId] = React.useState<number | null>(null);
  const [activeSection, setActiveSection] =
    React.useState<CarePlanSectionKey>('nutrition');

  const [basicsForm, setBasicsForm] = React.useState({
    starts_on: '',
    ends_on: '',
  });
  const [generateDayModalOpen, setGenerateDayModalOpen] = React.useState(false);
  const [generateDayModalForm, setGenerateDayModalForm] = React.useState({
    starts_on: '',
    ends_on: '',
  });
  const [generateDayModalErrors, setGenerateDayModalErrors] = React.useState<{
    starts_on?: string;
    ends_on?: string;
  }>({});
  const [dayNotesModalOpen, setDayNotesModalOpen] = React.useState(false);
  const [dayNotesDraft, setDayNotesDraft] = React.useState('');
  const [dayNotesSavedValue, setDayNotesSavedValue] = React.useState('');
  const [dayNotesError, setDayNotesError] = React.useState<
    string | undefined
  >();
  const [sectionSaveError, setSectionSaveError] = React.useState<
    string | undefined
  >();
  const [finishModalOpen, setFinishModalOpen] = React.useState(false);
  const [finishValidationResult, setFinishValidationResult] = React.useState<{
    is_valid: boolean;
    issues: CarePlanValidationIssue[];
  } | null>(null);
  const [itemFieldErrors, setItemFieldErrors] =
    React.useState<CarePlanItemFieldErrorsState>({});
  const [movementRowErrors, setMovementRowErrors] =
    React.useState<CarePlanMovementRowErrorsState>({});
  const sectionItemsRootRef = React.useRef<HTMLDivElement | null>(null);

  const builderQuery = useQuery({
    queryKey: ['care-plan', carePlanId, 'builder'],
    queryFn: async () => {
      const response = await getCarePlanBuilderById(carePlanId);
      if (response.status === 'error') {
        throw new Error(
          response.message ?? 'Could not load care plan workspace.',
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
      value: String(row.id),
      label: `${row.name} (${row.abbreviation})`,
      keywords: [row.name, row.abbreviation],
    }));
  }, [unitsLookupQuery.data]);

  const unitIdByToken = React.useMemo(() => {
    const map = new Map<string, number>();
    const rows = unitsLookupQuery.data ?? [];
    rows.forEach((row) => {
      map.set(String(row.id), row.id);
      map.set(toLookupToken(row.id), row.id);
      map.set(toLookupToken(row.abbreviation), row.id);
      map.set(toLookupToken(row.name), row.id);
    });
    return map;
  }, [unitsLookupQuery.data]);

  const resolveUnitId = React.useCallback(
    (value: string): number | null => {
      const direct = toNullableInteger(value);
      if (direct != null) return direct;
      return unitIdByToken.get(toLookupToken(value)) ?? null;
    },
    [unitIdByToken],
  );

  const resolveUnitComboboxValue = React.useCallback(
    (value: unknown): string | null => {
      const raw = normalizeValue(value);
      if (!raw) return null;
      const resolved = resolveUnitId(raw);
      return resolved != null ? String(resolved) : null;
    },
    [resolveUnitId],
  );

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
  const editable =
    !isDetailMode &&
    (normalizedStatus === 'draft' || normalizedStatus === 'scheduled');
  const hasGeneratedDays = (builder?.days.length ?? 0) > 0;
  const generateDayButtonLabel = hasGeneratedDays
    ? 'Change Timeline'
    : 'Set Timeline';
  const generateDayModalTitle = hasGeneratedDays
    ? 'Change Care Timeline'
    : 'Set Care Timeline';

  React.useEffect(() => {
    if (!builder) return;
    queueMicrotask(() => {
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
    });
  }, [builder]);

  const selectedDay = React.useMemo(
    () => builder?.days.find((day) => day.id === selectedDayId) ?? null,
    [builder, selectedDayId],
  );
  React.useEffect(() => {
    const next = String(selectedDay?.general_notes ?? '');
    queueMicrotask(() => {
      setDayNotesDraft(next);
      setDayNotesSavedValue(next);
      setDayNotesError(undefined);
    });
  }, [selectedDay?.id, selectedDay?.general_notes]);

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
    queueMicrotask(() => {
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
        setLocalItems(
          sectionItems.map((movementItem) => ({
            ...movementItem,
            exercises:
              editable &&
              (!Array.isArray(movementItem.exercises) ||
                movementItem.exercises.length === 0)
                ? [createEmptyMovementExercise()]
                : (movementItem.exercises ?? []),
          })),
        );
        return;
      }
      if (editable && sectionItems.length === 0) {
        setLocalItems([createEmptySectionItem()]);
        return;
      }
      setLocalItems(sectionItems);
    });
  }, [activeSection, editable, sectionItems]);

  React.useEffect(() => {
    queueMicrotask(() => {
      setSectionSaveError(undefined);
      setItemFieldErrors({});
      setMovementRowErrors({});
    });
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

  const scrollToFirstInvalidField = React.useCallback(() => {
    const root = sectionItemsRootRef.current;
    if (!root) return;

    requestAnimationFrame(() => {
      const invalidEl = root.querySelector<HTMLElement>('[aria-invalid="true"]');
      if (invalidEl) {
        invalidEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
        if (typeof invalidEl.focus === 'function') {
          invalidEl.focus({ preventScroll: true });
        }
        return;
      }

      const errorText = root.querySelector<HTMLElement>('.text-destructive');
      if (errorText) {
        errorText.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }
    });
  }, []);

  const scrollToLastItemCard = React.useCallback(() => {
    const root = sectionItemsRootRef.current;
    if (!root) return;

    requestAnimationFrame(() => {
      const cards = root.querySelectorAll<HTMLElement>('[data-care-plan-item-card]');
      const last = cards[cards.length - 1];
      if (!last) return;
      last.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    });
  }, []);

  const scrollToLastExerciseRow = React.useCallback((itemIndex: number) => {
    const root = sectionItemsRootRef.current;
    if (!root) return;

    requestAnimationFrame(() => {
      const rows = root.querySelectorAll<HTMLElement>(
        `[data-care-plan-exercise-row][data-item-index="${itemIndex}"]`,
      );
      const last = rows[rows.length - 1];
      if (!last) return;
      last.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    });
  }, []);

  const getDateRangeErrors = (payload: {
    starts_on: string;
    ends_on: string;
  }) => {
    const next: { starts_on?: string; ends_on?: string } = {};
    if (!payload.starts_on.trim()) {
      next.starts_on = 'The start date field is required.';
    }
    if (!payload.ends_on.trim()) {
      next.ends_on = 'The end date field is required.';
    }
    const startD = parseYmdLocal(payload.starts_on);
    const endD = parseYmdLocal(payload.ends_on);
    const today = startOfDay(new Date());
    const maxAllowedStart = addDays(today, MAX_START_OFFSET_DAYS);
    if (startD && startD.getTime() < today.getTime()) {
      next.starts_on = 'Start date must be today or later.';
    }
    if (startD && startD.getTime() > maxAllowedStart.getTime()) {
      next.starts_on = `Start date cannot be more than ${MAX_START_OFFSET_DAYS} days from today.`;
    }
    if (startD && endD && endD.getTime() < startD.getTime()) {
      next.ends_on = 'End date must be on or after the start date.';
    } else if (startD && endD) {
      const diffInDays =
        Math.floor((endD.getTime() - startD.getTime()) / 86400000) + 1;
      if (diffInDays > MAX_PLAN_DURATION_DAYS) {
        next.ends_on = `Plan duration cannot exceed ${MAX_PLAN_DURATION_DAYS} days.`;
      }
    }
    return next;
  };

  const generateMutation = useMutation({
    mutationFn: async (payload: {
      starts_on: string;
      ends_on: string;
      replace_existing: boolean;
    }) => {
      const response = await postCarePlanGenerateDays(carePlanId, {
        starts_on: payload.starts_on,
        ends_on: payload.ends_on,
        replace_existing: payload.replace_existing,
      });
      if (response.status === 'error') {
        throw new Error(response.message ?? 'Could not generate days.');
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success('The plan days have been generated successfully.');
      invalidateBuilder();
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Could not generate days.');
    },
  });

  const dayNotesMutation = useMutation({
    mutationFn: async (payload: {
      dayId: number;
      general_notes: string | null;
    }) => {
      const response = await patchCarePlanDayNotes(
        carePlanId,
        payload.dayId,
        payload,
      );
      if (response.status === 'error') {
        const fieldError = firstApiValidationMessage(
          response.errors?.general_notes,
        );
        throw new CarePlanDayNotesValidationError(
          response.message ?? 'Could not save day notes.',
          fieldError,
        );
      }
      return response.data;
    },
    onError: (error: Error) => {
      if (error instanceof CarePlanDayNotesValidationError) {
        if (error.fieldError) {
          setDayNotesError(error.fieldError);
          return;
        }
      }
      toast.error(error.message ?? 'Could not save day notes.');
    },
  });

  const openGenerateDayModal = () => {
    setGenerateDayModalForm({
      starts_on: basicsForm.starts_on.trim(),
      ends_on: basicsForm.ends_on.trim(),
    });
    setGenerateDayModalErrors({});
    setGenerateDayModalOpen(true);
  };

  const handleGenerateModalStartsOnChange = (startsYmd: string) => {
    setGenerateDayModalForm((prev) => {
      let ends = prev.ends_on;
      const next = parseYmdLocal(startsYmd);
      if (next && prev.ends_on.trim()) {
        const endD = parseYmdLocal(prev.ends_on);
        if (endD && endD.getTime() < next.getTime()) ends = '';
      }
      return { starts_on: startsYmd, ends_on: ends };
    });
    setGenerateDayModalErrors((prev) => {
      const next = { ...prev };
      delete next.starts_on;
      delete next.ends_on;
      return next;
    });
  };

  const handleGenerateModalEndsOnChange = (endsYmd: string) => {
    setGenerateDayModalForm((prev) => ({
      ...prev,
      ends_on: endsYmd,
    }));
    setGenerateDayModalErrors((prev) => {
      const next = { ...prev };
      delete next.ends_on;
      return next;
    });
  };

  const handleGenerateFromModal = () => {
    const payload = {
      starts_on: generateDayModalForm.starts_on.trim(),
      ends_on: generateDayModalForm.ends_on.trim(),
    };
    const errors = getDateRangeErrors(payload);
    setGenerateDayModalErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setBasicsForm(payload);
    generateMutation.mutate({
      ...payload,
      replace_existing: true,
    });
    setGenerateDayModalOpen(false);
  };

  const saveDayNotesIfNeeded = async (dayId: number): Promise<boolean> => {
    const nextValue = dayNotesDraft.trim();
    const savedValue = dayNotesSavedValue.trim();
    if (nextValue === savedValue) return false;
    setDayNotesError(undefined);
    await dayNotesMutation.mutateAsync({
      dayId,
      general_notes: nextValue.length > 0 ? nextValue : null,
    });
    queryClient.setQueryData(
      ['care-plan', carePlanId, 'builder'],
      (prev: typeof builderQuery.data) => {
        if (!prev) return prev;
        return {
          ...prev,
          days: prev.days.map((day) =>
            day.id === dayId
              ? { ...day, general_notes: nextValue.length > 0 ? nextValue : null }
              : day,
          ),
        };
      },
    );
    setDayNotesSavedValue(nextValue);
    return true;
  };

  const openDayNotesModal = (dayId: number) => {
    if (selectedDayId !== dayId) setSelectedDayId(dayId);
    setDayNotesModalOpen(true);
  };

  const getDayNoteVisual = (day: {
    id: number;
    day_number: number;
    general_notes?: string | null;
  }) => {
    const hasSavedNote = String(day.general_notes ?? '').trim().length > 0;
    const isSelectedDay = selectedDayId === day.id;
    const hasUnsavedNoteDraft =
      isSelectedDay && dayNotesDraft.trim() !== dayNotesSavedValue.trim();

    if (hasUnsavedNoteDraft) {
      return {
        icon: PencilLineIcon,
        label: 'Edit note',
        toneClass:
          'text-primary border-primary/30 bg-primary/10 hover:bg-primary/15',
      };
    }
    if (hasSavedNote) {
      return {
        icon: FileTextIcon,
        label: 'View note',
        toneClass:
          'text-primary border-primary/25 bg-primary/8 hover:bg-primary/12',
      };
    }
    return {
      icon: FilePlus2Icon,
      label: 'Add note',
      toneClass:
        'text-muted-foreground border-border/70 bg-background hover:bg-muted/70',
    };
  };

  const handleSaveDayNotesFromModal = async () => {
    if (!selectedDay) return;
    try {
      const didSave = await saveDayNotesIfNeeded(selectedDay.id);
      if (didSave) {
        const dayLabel =
          selectedDay?.day_number != null
            ? `The day ${selectedDay.day_number}`
            : 'The day';
        toast.success(`${dayLabel} note has been successfully saved.`);
      }
      setDayNotesModalOpen(false);
    } catch {
      // Mutation onError already handles inline messages and toast fallback.
    }
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
        `The ${SECTIONS.find((x) => x.key === activeSection)?.label?.toLowerCase() ?? ''} section has been saved successfully.`,
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
        scrollToFirstInvalidField();
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

    const sectionToValidate = activeSection;

    const isItemMeaningful = (
      item: CarePlanSectionItem | undefined,
    ): boolean => {
      if (!item) return false;
      const title = normalizeValue(item.title);
      const guidance = normalizeValue(item.guidance);
      const targetValue = normalizeValue(item.target_value);
      const targetUnit = normalizeValue(item.target_unit);
      const movementId = normalizeValue(
        item.movement_exercise_id || item.exercise_id,
      );

      if (sectionToValidate === 'movement') {
        const exercises = Array.isArray(item.exercises) ? item.exercises : [];
        const hasMeaningfulExercise = exercises.some((exercise) =>
          isMovementExerciseMeaningful(normalizeMovementExercise(exercise)),
        );
        return Boolean(
          title ||
          guidance ||
          targetValue ||
          targetUnit ||
          movementId ||
          hasMeaningfulExercise,
        );
      }

      return Boolean(title || guidance || targetValue || targetUnit);
    };

    for (let itemIndex = 0; itemIndex < localItems.length; itemIndex++) {
      const item = localItems[itemIndex];
      if (!isItemMeaningful(item)) continue;

      const title = normalizeValue(item?.title);
      if (!title) {
        itemFieldErrs[itemIndex] = {
          ...itemFieldErrs[itemIndex],
          title: 'The title field is required.',
        };
      }

      if (sectionToValidate === 'movement') {
        const exercises = Array.isArray(item?.exercises) ? item.exercises : [];
        const meaningfulExerciseRows = exercises
          .map((exercise, exerciseIndex) => ({
            exerciseIndex,
            normalized: normalizeMovementExercise(exercise),
          }))
          .filter((row) => isMovementExerciseMeaningful(row.normalized));

        if (meaningfulExerciseRows.length === 0) {
          movementRowErrs[`${itemIndex}-0`] = {
            ...movementRowErrs[`${itemIndex}-0`],
            exercise: 'Please select an exercise for this row.',
          };
        } else {
          for (const row of meaningfulExerciseRows) {
            if (!row.normalized.movement_exercise_id) {
              movementRowErrs[`${itemIndex}-${row.exerciseIndex}`] = {
                ...movementRowErrs[`${itemIndex}-${row.exerciseIndex}`],
                exercise: 'Please select an exercise for this row.',
              };
            }
          }
        }
      } else {
        const val = normalizeValue(item?.target_value);
        const unit = normalizeValue(item?.target_unit);
        if (val && !unit) {
          itemFieldErrs[itemIndex] = {
            ...itemFieldErrs[itemIndex],
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
      scrollToFirstInvalidField();
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
    setFinishValidationResult(null);
    setFinishModalOpen(true);
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

  const saveCurrentSectionIfNeeded = async (): Promise<number | null> => {
    const dayId = validateSectionBeforeSave();
    if (!dayId) return null;
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
        items: toSectionSavePayload(
          normalizedLocalItems,
          activeSection,
          resolveUnitId,
        ),
      });
    }
    try {
      await saveDayNotesIfNeeded(dayId);
    } catch {
      setDayNotesModalOpen(true);
      return null;
    }

    return dayId;
  };

  const handleSaveSection = async (moveForward = false) => {
    const dayId = await saveCurrentSectionIfNeeded();
    if (!dayId) return;

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
      toast.success('The care plan revision has been created successfully.');
      if (data?.id != null) {
        router.push(ROUTES.ADMIN.MODULES.CARE_PLANS.WORKSPACE(String(data.id)));
      }
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Could not create care plan revision.');
    },
  });

  const validateMutation = useMutation({
    mutationFn: async () => {
      const response = await postCarePlanValidate(carePlanId);
      if (response.status === 'error') {
        throw new Error(response.message ?? 'Could not validate care plan.');
      }
      return response.data;
    },
    onSuccess: (data) => {
      setFinishValidationResult({
        is_valid: Boolean(data?.is_valid),
        issues: Array.isArray(data?.issues) ? data.issues : [],
      });
      if (data?.is_valid) {
        toast.success('The care plan is valid and ready for activation.');
      } else {
        toast.error('Care plan has validation issues. Please review.');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Could not validate care plan.');
    },
  });

  const handleFinalizeFromModal = async () => {
    const dayId = await saveCurrentSectionIfNeeded();
    if (!dayId) return;

    setFinishModalOpen(false);
    router.push(ROUTES.ADMIN.MODULES.CARE_PLANS.DETAIL(String(carePlanId)));
  };

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
    scrollToLastExerciseRow(itemIndex);
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

  const startDateForGenerateModal = parseYmdLocal(
    generateDayModalForm.starts_on,
  );
  const generateModalEndCalendarDisabled = startDateForGenerateModal
    ? {
        before: startDateForGenerateModal,
        after: addDays(startDateForGenerateModal, MAX_PLAN_DURATION_DAYS - 1),
      }
    : undefined;
  const generateModalStartCalendarDisabled = {
    before: startOfDay(new Date()),
    after: addDays(startOfDay(new Date()), MAX_START_OFFSET_DAYS),
  };
  const rangePreviewLabel = React.useMemo(() => {
    const start = parseYmdLocal(generateDayModalForm.starts_on);
    const end = parseYmdLocal(generateDayModalForm.ends_on);
    if (!start || !end) return undefined;
    const diffInDays =
      Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
    if (diffInDays <= 0) return undefined;
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} selected`;
  }, [generateDayModalForm.starts_on, generateDayModalForm.ends_on]);
  const hasGenerateOverwriteWarning =
    Boolean(builder?.starts_on?.trim()) &&
    Boolean(builder?.ends_on?.trim()) &&
    (generateDayModalForm.starts_on.trim() !==
      (builder?.starts_on ?? '').trim() ||
      generateDayModalForm.ends_on.trim() !== (builder?.ends_on ?? '').trim());
  const isScheduledPlan = normalizedStatus === 'scheduled';
  const selectedGenerateStartDate = parseYmdLocal(generateDayModalForm.starts_on);
  const showScheduledDraftDemotionWarning =
    isScheduledPlan &&
    selectedGenerateStartDate != null &&
    selectedGenerateStartDate.getTime() <= startOfDay(new Date()).getTime();

  const addItem = () => {
    if (activeSection === 'movement') {
      setLocalItems((prev) => [
        ...prev,
        {
          ...createEmptySectionItem(),
          exercises: [createEmptyMovementExercise()],
        },
      ]);
      scrollToLastItemCard();
      return;
    }
    setLocalItems((prev) => [...prev, createEmptySectionItem()]);
    scrollToLastItemCard();
  };

  const removeItem = (index: number) => {
    setLocalItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  if (builderQuery.isPending) {
    return (
      <div className='text-muted-foreground text-sm'>
        Loading care plan workspace...
      </div>
    );
  }

  if (builderQuery.isError) {
    return (
      <div className='text-destructive rounded-md border p-4 text-sm'>
        {builderQuery.error instanceof Error
          ? builderQuery.error.message
          : 'Could not load care plan workspace.'}
      </div>
    );
  }

  if (!builder) return null;

  const clientAvatarSrc = resolveClientPictureUrl(builder.client?.picture_url);

  return (
    <div className='space-y-6'>
      <section className='border-border max-w-full min-w-0 space-y-5 rounded-md border bg-white p-4 shadow-xs sm:p-5 lg:p-6'>
        <div className='space-y-4'>
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
              {editable ? (
                <Button
                  type='button'
                  className='h-10 shrink-0 gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
                  disabled={generateMutation.isPending}
                  onClick={openGenerateDayModal}
                >
                  {hasGeneratedDays ? (
                    <RefreshCwIcon className='size-3.5' />
                  ) : (
                    <CalendarIcon className='size-3.5' />
                  )}
                  {generateDayButtonLabel}
                </Button>
              ) : null}
            </div>
          </div>

          <div className='border-border/70 border-t' />

          <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='bg-muted/50 border-border flex min-h-18 flex-col justify-center rounded-md border px-2.5 py-2'>
              <p className='text-muted-foreground text-[10px] font-semibold tracking-wide uppercase'>
                Client
              </p>
              <div className='mt-1 flex min-w-0 items-center gap-2.5'>
                <Avatar
                  className='border-border/60 bg-background size-9 border'
                  size='default'
                >
                  {clientAvatarSrc ? (
                    <AvatarImage
                      src={clientAvatarSrc}
                      alt=''
                      className='object-cover'
                    />
                  ) : null}
                  <AvatarFallback className='bg-primary/10 text-primary text-[11px] font-bold'>
                    {getNameInitials(builder.client?.name ?? null)}
                  </AvatarFallback>
                </Avatar>
                <div className='min-w-0 flex-1'>
                  <p className='text-foreground/90 line-clamp-1 text-[12.5px] font-semibold'>
                    {builder.client?.name?.trim() || 'Not assigned'}
                  </p>
                  {builder.client?.code?.trim() ? (
                    <p className='text-muted-foreground mt-0.5 truncate text-[11px] font-semibold tabular-nums'>
                      {builder.client.code.trim()}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className='bg-muted/50 border-border flex min-h-18 flex-col justify-center rounded-md border px-2.5 py-2'>
              <p className='text-muted-foreground text-[10px] font-semibold tracking-wide uppercase'>
                Program
              </p>
              <p className='text-foreground/90 line-clamp-2 text-[12.5px] font-semibold'>
                {builder.program?.name?.trim() || 'Not linked'}
              </p>
              {builder.program?.code?.trim() ? (
                <p className='text-muted-foreground mt-0.5 truncate text-[11px] font-semibold tabular-nums'>
                  {builder.program.code.trim()}
                </p>
              ) : null}
            </div>

            <div className='bg-muted/50 border-border flex min-h-18 flex-col justify-center rounded-md border px-2.5 py-2'>
              <p className='text-muted-foreground text-[10px] font-semibold tracking-wide uppercase'>
                Enrollment
              </p>
              <p className='text-foreground truncate text-[12.5px] font-semibold tabular-nums'>
                {builder.enrollment?.code?.trim() ||
                  (builder.enrollment_id != null
                    ? `#${builder.enrollment_id}`
                    : 'Not linked')}
              </p>
              <p className='text-muted-foreground mt-0.5 truncate text-[11px] font-semibold'>
                Cycle {builder.cycle_number ?? '—'}
              </p>
            </div>

            <div className='bg-muted/50 border-border/60 flex min-h-18 flex-col justify-center rounded-md border px-2.5 py-2'>
              <p className='text-muted-foreground text-[10px] font-semibold tracking-wide uppercase'>
                Plan Timeline
              </p>
              <p className='text-foreground text-[12.5px] font-semibold'>
                Care Window
              </p>
              <p className='text-muted-foreground mt-0.5 truncate text-[11px] font-semibold'>
                {builder.starts_on
                  ? formatTargetDateLabel(builder.starts_on)
                  : 'Start date not set'}
                {'  '}→{'  '}
                {builder.ends_on
                  ? formatTargetDateLabel(builder.ends_on)
                  : 'End date not set'}
              </p>
            </div>
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

        {!hasGeneratedDays ? (
          <div className='from-primary/5 to-background border-border relative overflow-hidden rounded-md border border-dashed bg-linear-to-br p-8'>
            <div className='mx-auto flex max-w-xl flex-col items-center text-center'>
              <div className='bg-primary/10 border-primary/20 text-primary mb-3 inline-flex size-10 items-center justify-center rounded-md border'>
                {hasGeneratedDays ? (
                  <RefreshCwIcon className='size-4' aria-hidden />
                ) : (
                  <CalendarIcon className='size-4' aria-hidden />
                )}
              </div>
              <p className='text-foreground text-sm font-semibold capitalize'>
                No day plans are currently available.
              </p>
              <p className='text-muted-foreground mt-1 text-[13px] font-medium'>
                Generate a day schedule first, then define section tasks for
                each day across nutrition, movement, activity, and recovery.
              </p>
              {editable ? (
                <Button
                  type='button'
                  className='mt-4 h-10 gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
                  disabled={generateMutation.isPending}
                  onClick={openGenerateDayModal}
                >
                  {hasGeneratedDays ? (
                    <RefreshCwIcon className='size-3.5' />
                  ) : (
                    <CalendarIcon className='size-3.5' />
                  )}
                  {generateDayButtonLabel}
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
              <div className='border-border flex max-h-[min(78vh,640px)] flex-col overflow-hidden rounded-md border bg-white lg:col-span-3'>
                <div className='border-border bg-card border-b px-3 py-2.5'>
                  <span className='text-foreground/90 text-[13px] font-semibold'>
                    Day schedule
                  </span>
                  <p className='text-muted-foreground mt-0.5 text-[11px] leading-snug font-medium'>
                    Choose a day to edit nutrition, movement, activity, and
                    recovery.
                  </p>
                </div>
                <div className='min-h-0 flex-1 overflow-y-auto bg-white p-1.5'>
                  {builder.days.length === 0 ? (
                    <p className='text-muted-foreground p-2 text-sm'>
                      No days generated yet.
                    </p>
                  ) : (
                    <ul className='flex flex-col gap-1'>
                      {builder.days.map((day) => {
                        const noteVisual = getDayNoteVisual(day);
                        const NoteIcon = noteVisual.icon;
                        const isSelected = selectedDayId === day.id;
                        return (
                          <li key={day.id} className='relative'>
                            <button
                              type='button'
                              className={cn(
                                'w-full min-w-0 rounded-md border px-3 py-2.5 pr-11 text-left transition-all',
                                isSelected
                                  ? 'bg-primary/8 border-primary/40 text-foreground shadow-xs'
                                  : 'text-foreground/90 hover:border-border/70 hover:bg-background/80 border-transparent',
                              )}
                              onClick={() => {
                                setSelectedDayId(day.id);
                                setActiveSection('nutrition');
                              }}
                            >
                              <span className='block text-[12.5px] font-semibold tracking-tight'>
                                Day {day.day_number}
                              </span>
                              <span
                                className={cn(
                                  'mt-0.5 block text-[11px] font-medium',
                                  isSelected
                                    ? 'text-muted-foreground'
                                    : 'text-muted-foreground/90',
                                )}
                              >
                                {formatTargetDateLabel(day.target_date)}
                              </span>
                            </button>
                            {editable ? (
                              <span
                                role='button'
                                tabIndex={0}
                                aria-label={`${noteVisual.label} for day ${day.day_number}`}
                                className={cn(
                                  'absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md border transition-colors focus-visible:ring-2 focus-visible:outline-hidden',
                                  isSelected
                                    ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/15'
                                    : noteVisual.toneClass,
                                  dayNotesMutation.isPending
                                    ? 'pointer-events-none opacity-60'
                                    : '',
                                )}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  if (dayNotesMutation.isPending) return;
                                  openDayNotesModal(day.id);
                                }}
                                onKeyDown={(event) => {
                                  if (
                                    event.key === 'Enter' ||
                                    event.key === ' '
                                  ) {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    if (dayNotesMutation.isPending) return;
                                    openDayNotesModal(day.id);
                                  }
                                }}
                              >
                                <NoteIcon className='size-3.5' />
                              </span>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              <div className='border-border rounded-md border p-4 lg:col-span-9'>
                {!selectedDay ? (
                  <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
                    Select a day to manage section items.
                  </div>
                ) : (
                  <div className='space-y-4' ref={sectionItemsRootRef}>
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
                          className='space-y-5'
                        >
                          {localItems.length === 0 ? (
                            <p className='text-muted-foreground text-sm'>
                              There are currently no items in this section.
                            </p>
                          ) : null}

                          {localItems.map((item, index) => (
                            <div
                              key={`${index}-${item.id ?? 'new'}`}
                              data-care-plan-item-card
                              className='border-border bg-muted/20 rounded-md border p-4 md:p-5'
                            >
                              <div className='space-y-4.5'>
                                <div className='grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] sm:items-start'>
                                  <TextField
                                    label='Task'
                               
                                    placeholder={
                                      activeSection === 'nutrition'
                                        ? 'Enter a task name (e.g. Breakfast)'
                                        : activeSection === 'movement'
                                          ? 'Enter a task name (e.g. Strength Training Session)'
                                          : activeSection === 'activity'
                                            ? 'Enter a task name (e.g. Morning walk)'
                                            : 'Enter a task name (e.g. Sleep)'
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
                                  {editable ? (
                                    <Button
                                      type='button'
                                      variant='outline'
                                      size='icon'
                                      className='text-foreground bg-background hover:text-destructive hover:border-destructive/50 hover:bg-destructive/5 mt-7 h-11 w-11 shrink-0 border-neutral-300'
                                      onClick={() => removeItem(index)}
                                      aria-label='Remove item'
                                      disabled={localItems.length <= 1}
                                    >
                                      <Trash2Icon className='size-4' />
                                    </Button>
                                  ) : null}
                                </div>
                                <TextAreaField
                                  label='Guidance'
                                  rows={3}
                                  placeholder='Provide clear, step-by-step instructions for the client to follow independently.'
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
                                          const selectedExerciseIds = new Set(
                                            (item.exercises ?? [])
                                              .map((row, rowIndex) =>
                                                rowIndex === exerciseIndex
                                                  ? ''
                                                  : String(
                                                      row.movement_exercise_id ??
                                                        '',
                                                    ).trim(),
                                              )
                                              .filter((value) => value !== ''),
                                          );
                                          const movementExerciseOptionsForRow =
                                            movementExerciseOptions.filter(
                                              (option) =>
                                                !selectedExerciseIds.has(
                                                  String(option.value).trim(),
                                                ) ||
                                                String(option.value).trim() ===
                                                  exerciseId,
                                            );
                                          return (
                                            <div
                                              key={`${exerciseId || 'new'}-${exerciseIndex}`}
                                              data-care-plan-exercise-row
                                              data-item-index={index}
                                              className='border-border space-y-3 rounded-md border p-5'
                                            >
                                              <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                                                <div className='min-w-0 flex-1'>
                                                  <ComboboxField
                                                    label='Exercise'
                                                    placeholder='Please select an exercise…'
                                                    searchPlaceholder='Search exercise…'
                                                    emptyMessage='No exercises found.'
                                                    options={
                                                      movementExerciseOptionsForRow
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
                                                    className='text-foreground bg-background hover:text-destructive hover:border-destructive/50 hover:bg-destructive/5 h-11 w-11 shrink-0 self-end border-neutral-300 sm:mt-7 sm:self-start'
                                                    onClick={() =>
                                                      removeMovementExerciseRow(
                                                        index,
                                                        exerciseIndex,
                                                      )
                                                    }
                                                    aria-label='Remove exercise row'
                                                    disabled={
                                                      (item.exercises?.length ??
                                                        0) <= 1
                                                    }
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
                                      label='Target'                          
                                      type='number'
                                      placeholder='Enter a target value'
                                      value={String(item.target_value ?? '')}
                                      onChange={(event) =>
                                        setItemField(
                                          index,
                                          'target_value',
                                          event.target.value,
                                        )
                                      }
                                      error={
                                        itemFieldErrors[index]?.target_value
                                      }
                                      disabled={!editable}
                                    />
                                    <ComboboxField
                                      label='Measurement'
                                      placeholder='Please select a measurement unit…'
                                      searchPlaceholder='Search measurement unit…'
                                      emptyMessage='No measurement units found.'
                                      options={unitOptions}
                                      value={resolveUnitComboboxValue(
                                        item.target_unit,
                                      )}
                                      onChange={(value) =>
                                        setItemField(
                                          index,
                                          'target_unit',
                                          value ?? '',
                                        )
                                      }
                                      error={
                                        itemFieldErrors[index]?.target_unit
                                      }
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
                                  <Button
                                    type='button'
                                    variant='outline'
                                    className='text-foreground bg-background hover:bg-muted h-10 gap-1.5 border-neutral-300 px-3 text-[13px]! font-semibold'
                                    onClick={addItem}
                                  >
                                    <PlusIcon className='size-3.5' />
                                    {SECTION_ADD_LABEL[activeSection]}
                                  </Button>
                                </div>
                                <div className='flex flex-wrap items-center justify-end gap-2'>
                                  <Button
                                    type='button'
                                    variant='outline'
                                    className='text-foreground bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
                                    onClick={moveToPreviousStep}
                                    disabled={
                                      !canGoBack ||
                                      sectionSaveMutation.isPending ||
                                      dayNotesMutation.isPending
                                    }
                                  >
                                    <ArrowLeftIcon className='size-3.5' />
                                    Previous
                                  </Button>
                                  <Button
                                    type='button'
                                    className='h-10 gap-1.5 px-3 text-[13px]! font-semibold'
                                    disabled={
                                      sectionSaveMutation.isPending ||
                                      dayNotesMutation.isPending
                                    }
                                    onClick={() => void handleSaveSection(true)}
                                  >
                                    {!sectionSaveMutation.isPending &&
                                    !dayNotesMutation.isPending &&
                                    isLastSection &&
                                    isLastDay ? (
                                      <CheckCircle2Icon className='size-3.5' />
                                    ) : null}
                                    {sectionSaveMutation.isPending ||
                                    dayNotesMutation.isPending
                                      ? 'Saving…'
                                      : isLastSection
                                        ? isLastDay
                                          ? 'Finalize Care Plan'
                                          : 'Continue to Next Day'
                                        : 'Continue'}
                                    {!sectionSaveMutation.isPending &&
                                    !dayNotesMutation.isPending &&
                                    !(isLastSection && isLastDay) ? (
                                      <ChevronRightIcon className='size-3.5' />
                                    ) : null}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <CarePlanDayNoteModal
        open={dayNotesModalOpen}
        dayLabel={
          selectedDay
            ? `Day ${selectedDay.day_number} (${formatTargetDateLabel(selectedDay.target_date)})`
            : 'Selected day'
        }
        notes={dayNotesDraft}
        error={dayNotesError}
        isSaving={dayNotesMutation.isPending}
        onOpenChange={setDayNotesModalOpen}
        onNotesChange={(value) => {
          setDayNotesDraft(value);
          if (dayNotesError) setDayNotesError(undefined);
        }}
        onSave={() => void handleSaveDayNotesFromModal()}
      />

      <CarePlanGenerateDaysModal
        open={generateDayModalOpen}
        title={generateDayModalTitle}
        submitLabel={generateDayButtonLabel}
        isRegenerate={hasGeneratedDays}
        startsOn={generateDayModalForm.starts_on}
        endsOn={generateDayModalForm.ends_on}
        startsOnError={generateDayModalErrors.starts_on}
        endsOnError={generateDayModalErrors.ends_on}
        showOverwriteWarning={hasGenerateOverwriteWarning}
        showScheduledDraftDemotionWarning={showScheduledDraftDemotionWarning}
        isSubmitting={generateMutation.isPending}
        startDateDisabled={generateModalStartCalendarDisabled}
        endDateDisabled={generateModalEndCalendarDisabled}
        rangePreviewLabel={rangePreviewLabel}
        onOpenChange={setGenerateDayModalOpen}
        onStartsOnChange={handleGenerateModalStartsOnChange}
        onEndsOnChange={handleGenerateModalEndsOnChange}
        onSubmit={handleGenerateFromModal}
      />

      <CarePlanFinalizeConfirmation
        open={finishModalOpen}
        isValidating={validateMutation.isPending}
        planReference={builder?.code?.trim() || `#${carePlanId}`}
        validationResult={finishValidationResult}
        onOpenChange={setFinishModalOpen}
        onValidate={() => validateMutation.mutate()}
        onFinalize={() => void handleFinalizeFromModal()}
      />
    </div>
  );
}
