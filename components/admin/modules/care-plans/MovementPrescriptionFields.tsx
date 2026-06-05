'use client';

import ComboboxField, {
  type ComboboxOption,
} from '@/components/shared/form/ComboBoxField';
import TextField from '@/components/shared/form/TextField';
import type {
  PrescriptionFieldHints,
  PrescriptionFieldLabels,
  PrescriptionFieldPlaceholders,
  PrescriptionProfile,
} from '@/domains/movement-prescriptions/types';
import {
  getPrescriptionFieldHint,
  getPrescriptionFieldLabel,
  getPrescriptionFieldPlaceholder,
  isPrescriptionFieldVisible,
  type MovementExercisePrescriptionInput,
} from '@/lib/care-plans/movementPrescription';
import { cn } from '@/lib/utils/styles';

export type MovementPrescriptionRowErrors = {
  exercise?: string;
  sets?: string;
  reps?: string;
  rest_seconds?: string;
  duration_seconds?: string;
  intensity?: string;
  equipment_weight?: string;
  equipment_weight_unit_id?: string;
};

type MovementPrescriptionFieldsProps = {
  exercise: MovementExercisePrescriptionInput;
  profile: PrescriptionProfile | null;
  fieldLabels?: PrescriptionFieldLabels | null;
  fieldPlaceholders?: PrescriptionFieldPlaceholders | null;
  fieldHints?: PrescriptionFieldHints | null;
  intensityOptions: ComboboxOption[];
  massUnitOptions: ComboboxOption[];
  errors?: MovementPrescriptionRowErrors;
  disabled?: boolean;
  onFieldChange: (
    field: keyof MovementExercisePrescriptionInput,
    value: string,
  ) => void;
};

function PrescriptionFieldHint({
  hint,
  disabled = false,
}: {
  hint?: string;
  disabled?: boolean;
}) {
  if (disabled || !hint?.trim()) return null;

  return (
    <p className='text-muted-foreground text-[11px] leading-relaxed font-medium'>
      {hint.trim()}
    </p>
  );
}

type SecondsFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  min?: number;
  max: number;
  onChange: (value: string) => void;
};

function SecondsField({
  label,
  value,
  placeholder,
  hint,
  error,
  disabled = false,
  min = 0,
  max,
  onChange,
}: SecondsFieldProps) {
  return (
    <div className='space-y-1'>
      <TextField
        label={label}
        type='number'
        min={min}
        max={max}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        error={error}
        disabled={disabled}
      />
      <PrescriptionFieldHint hint={hint} disabled={disabled} />
    </div>
  );
}

/**
 * Picks a balanced column count for prescription inputs:
 * 4 fields → 2×2, 3/5/6 → up to 3 columns (5 renders as 3+2), etc.
 */
function getPrescriptionGridColumns(fieldCount: number): 1 | 2 | 3 {
  if (fieldCount <= 1) return 1;
  if (fieldCount === 2 || fieldCount === 4) return 2;
  return 3;
}

function prescriptionGridClassName(columnCount: 1 | 2 | 3): string {
  return cn(
    'grid gap-3',
    columnCount === 1 && 'grid-cols-1',
    columnCount === 2 && 'grid-cols-1 sm:grid-cols-2',
    columnCount === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  );
}

function chunkPrescriptionFieldRows<T>(
  fields: T[],
  primaryColumns: 1 | 2 | 3,
): T[][] {
  if (fields.length === 0) return [];

  const rows: T[][] = [];
  let index = 0;

  while (index < fields.length) {
    const remaining = fields.length - index;
    if (remaining >= primaryColumns) {
      rows.push(fields.slice(index, index + primaryColumns));
      index += primaryColumns;
      continue;
    }

    rows.push(fields.slice(index));
    index = fields.length;
  }

  return rows;
}

export default function MovementPrescriptionFields({
  exercise,
  profile,
  fieldLabels,
  fieldPlaceholders,
  fieldHints,
  intensityOptions,
  massUnitOptions,
  errors,
  disabled = false,
  onFieldChange,
}: MovementPrescriptionFieldsProps) {
  if (!profile) return null;

  const showDuration = isPrescriptionFieldVisible(profile, 'duration_seconds');
  const showIntensity = isPrescriptionFieldVisible(profile, 'intensity');
  const showWeight = isPrescriptionFieldVisible(profile, 'equipment_weight');
  const showWeightUnit = isPrescriptionFieldVisible(
    profile,
    'equipment_weight_unit_id',
  );
  const showSets = isPrescriptionFieldVisible(profile, 'sets');
  const showReps = isPrescriptionFieldVisible(profile, 'reps');
  const showRest = isPrescriptionFieldVisible(profile, 'rest_seconds');

  const fieldNodes = [
    showSets ? (
      <div key='sets' className='space-y-1'>
        <TextField
          label={getPrescriptionFieldLabel(profile, 'sets', fieldLabels)}
          type='number'
          min={1}
          max={1000}
          placeholder={getPrescriptionFieldPlaceholder('sets', fieldPlaceholders)}
          value={exercise.sets}
          onChange={(event) => onFieldChange('sets', event.target.value)}
          error={errors?.sets}
          disabled={disabled}
        />
        <PrescriptionFieldHint
          hint={getPrescriptionFieldHint('sets', fieldHints)}
          disabled={disabled}
        />
      </div>
    ) : null,
    showReps ? (
      <div key='reps' className='space-y-1'>
        <TextField
          label={getPrescriptionFieldLabel(profile, 'reps', fieldLabels)}
          type='number'
          min={1}
          max={1000}
          placeholder={getPrescriptionFieldPlaceholder('reps', fieldPlaceholders)}
          value={exercise.reps}
          onChange={(event) => onFieldChange('reps', event.target.value)}
          error={errors?.reps}
          disabled={disabled}
        />
        <PrescriptionFieldHint
          hint={getPrescriptionFieldHint('reps', fieldHints)}
          disabled={disabled}
        />
      </div>
    ) : null,
    showDuration ? (
      <SecondsField
        key='duration_seconds'
        label={getPrescriptionFieldLabel(
          profile,
          'duration_seconds',
          fieldLabels,
        )}
        value={exercise.duration_seconds}
        placeholder={getPrescriptionFieldPlaceholder(
          'duration_seconds',
          fieldPlaceholders,
        )}
        hint={getPrescriptionFieldHint('duration_seconds', fieldHints)}
        error={errors?.duration_seconds}
        disabled={disabled}
        min={1}
        max={86400}
        onChange={(value) => onFieldChange('duration_seconds', value)}
      />
    ) : null,
    showRest ? (
      <SecondsField
        key='rest_seconds'
        label={getPrescriptionFieldLabel(profile, 'rest_seconds', fieldLabels)}
        value={exercise.rest_seconds}
        placeholder={getPrescriptionFieldPlaceholder(
          'rest_seconds',
          fieldPlaceholders,
        )}
        hint={getPrescriptionFieldHint('rest_seconds', fieldHints)}
        error={errors?.rest_seconds}
        disabled={disabled}
        max={7200}
        onChange={(value) => onFieldChange('rest_seconds', value)}
      />
    ) : null,
    showIntensity ? (
      <div key='intensity' className='space-y-1'>
        <ComboboxField
          label={getPrescriptionFieldLabel(profile, 'intensity', fieldLabels)}
          placeholder='Optional — select intensity…'
          searchPlaceholder='Search intensity…'
          emptyMessage='No intensity levels found.'
          options={intensityOptions}
          value={exercise.intensity || null}
          onChange={(value) => onFieldChange('intensity', value ?? '')}
          error={errors?.intensity}
          disabled={disabled}
        />
        <PrescriptionFieldHint
          hint={getPrescriptionFieldHint('intensity', fieldHints)}
          disabled={disabled}
        />
      </div>
    ) : null,
    showWeight ? (
      <div key='equipment_weight' className='space-y-1'>
        <TextField
          label={getPrescriptionFieldLabel(
            profile,
            'equipment_weight',
            fieldLabels,
          )}
          type='number'
          min={0}
          max={99999.99}
          step='0.01'
          placeholder={getPrescriptionFieldPlaceholder(
            'equipment_weight',
            fieldPlaceholders,
          )}
          value={exercise.equipment_weight}
          onChange={(event) =>
            onFieldChange('equipment_weight', event.target.value)
          }
          error={errors?.equipment_weight}
          disabled={disabled}
        />
        <PrescriptionFieldHint
          hint={getPrescriptionFieldHint('equipment_weight', fieldHints)}
          disabled={disabled}
        />
      </div>
    ) : null,
    showWeightUnit ? (
      <div key='equipment_weight_unit_id' className='space-y-1'>
        <ComboboxField
          label={getPrescriptionFieldLabel(
            profile,
            'equipment_weight_unit_id',
            fieldLabels,
          )}
          placeholder='Select weight unit…'
          searchPlaceholder='Search units…'
          emptyMessage='No mass units found.'
          options={massUnitOptions}
          value={exercise.equipment_weight_unit_id || null}
          onChange={(value) =>
            onFieldChange('equipment_weight_unit_id', value ?? '')
          }
          error={errors?.equipment_weight_unit_id}
          disabled={disabled}
        />
        <PrescriptionFieldHint
          hint={getPrescriptionFieldHint(
            'equipment_weight_unit_id',
            fieldHints,
          )}
          disabled={disabled}
        />
      </div>
    ) : null,
  ].filter((node): node is NonNullable<typeof node> => node != null);

  const primaryColumns = getPrescriptionGridColumns(fieldNodes.length);
  const fieldRows = chunkPrescriptionFieldRows(fieldNodes, primaryColumns);

  return (
    <div className='mt-4 space-y-3'>
      {exercise.summary?.trim() && disabled ? (
        <p className='text-muted-foreground text-[12px] font-medium'>
          Prescription:{' '}
          <span className='text-foreground font-semibold'>
            {exercise.summary.trim()}
          </span>
        </p>
      ) : null}

      <div className='space-y-3'>
        {fieldRows.map((row, rowIndex) => {
          const rowColumns =
            row.length < primaryColumns
              ? (row.length as 1 | 2 | 3)
              : primaryColumns;

          return (
            <div
              key={`prescription-row-${rowIndex}`}
              className={prescriptionGridClassName(rowColumns)}
            >
              {row}
            </div>
          );
        })}
      </div>
    </div>
  );
}
