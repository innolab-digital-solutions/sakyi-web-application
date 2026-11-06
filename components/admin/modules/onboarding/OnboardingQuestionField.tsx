'use client';

import FileUploadField from '@/components/shared/form/FileUploadField';
import SelectField from '@/components/shared/form/SelectField';
import TextField from '@/components/shared/form/TextField';
import {
  ADMIN_IMAGE_UPLOAD_ACCEPT,
  ADMIN_IMAGE_UPLOAD_MAX_BYTES,
} from '@/config/uploads/admin-image-upload';
import type {
  OnboardingIntakeQuestion,
  OnboardingQuestionOption,
} from '@/domains/intake-assessments/types';

type OnboardingQuestionFieldProps = {
  question: OnboardingIntakeQuestion;
  value: string | number | string[] | number[] | File | null;
  error?: string;
  disabled?: boolean;
  onChange: (
    value: string | number | string[] | number[] | File | null,
  ) => void;
};

function buildPlaceholder(question: OnboardingIntakeQuestion): string {
  const cleanedLabel = question.question
    .replace(/[?*:]/g, '')
    .trim()
    .toLowerCase();
  const target = cleanedLabel.length > 0 ? cleanedLabel : 'value';

  if (question.type === 'select') {
    return `Select ${target}`;
  }

  if (question.type === 'multiselect') {
    return `Select one or more ${target}`;
  }

  if (question.type === 'date') {
    return 'Select a date';
  }

  if (question.type === 'number') {
    return `Enter ${target}`;
  }

  return `Enter ${target}`;
}

function getSelectOptions(
  options: unknown,
): { label: string; value: string }[] {
  const normalizedOptions = Array.isArray(options)
    ? (options as OnboardingQuestionOption[])
    : [];

  const prettifyOptionLabel = (raw: string): string => {
    return raw
      .replace(/[_-]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter((part) => part.length > 0)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  };

  const seen = new Set<string>();
  const uniqueOptions: { label: string; value: string }[] = [];

  for (const option of normalizedOptions) {
    const normalizedValue =
      typeof option === 'string' ? option.trim() : String(option.value).trim();
    const normalizedLabel =
      typeof option === 'string' ? option.trim() : String(option.label).trim();

    if (normalizedValue.length === 0) continue;

    if (seen.has(normalizedValue)) continue;
    seen.add(normalizedValue);
    uniqueOptions.push({
      label: prettifyOptionLabel(
        normalizedLabel.length > 0 ? normalizedLabel : normalizedValue,
      ),
      value: normalizedValue,
    });
  }

  return uniqueOptions;
}

function normalizeNonNegativeNumberInput(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return '';
  if (trimmed === '-') return '0';

  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) return raw;

  return parsed < 0 ? '0' : raw;
}

export default function OnboardingQuestionField({
  question,
  value,
  error,
  disabled,
  onChange,
}: OnboardingQuestionFieldProps) {
  if (question.type === 'text') {
    return (
      <TextField
        label={question.question}
        placeholder={buildPlaceholder(question)}
        required={question.required}
        disabled={disabled}
        value={typeof value === 'string' ? value : ''}
        error={error}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (question.type === 'number') {
    return (
      <TextField
        label={question.question}
        placeholder={buildPlaceholder(question)}
        required={question.required}
        type='number'
        min={0}
        disabled={disabled}
        value={
          typeof value === 'number' || typeof value === 'string' ? value : ''
        }
        error={error}
        onChange={(event) =>
          onChange(normalizeNonNegativeNumberInput(event.target.value))
        }
      />
    );
  }

  if (question.type === 'date') {
    return (
      <TextField
        label={question.question}
        placeholder={buildPlaceholder(question)}
        required={question.required}
        type='date'
        disabled={disabled}
        value={typeof value === 'string' ? value : ''}
        error={error}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (question.type === 'select') {
    return (
      <SelectField
        label={question.question}
        placeholder={buildPlaceholder(question)}
        required={question.required}
        disabled={disabled}
        options={getSelectOptions(question.options)}
        value={typeof value === 'string' ? value : undefined}
        error={error}
        onChange={(nextValue) => onChange(nextValue ?? '')}
      />
    );
  }

  if (question.type === 'multiselect') {
    const selected = Array.isArray(value)
      ? value.map((item) => String(item))
      : ([] as string[]);

    return (
      <SelectField
        multiple
        label={question.question}
        placeholder={buildPlaceholder(question)}
        required={question.required}
        disabled={disabled}
        options={getSelectOptions(question.options)}
        value={selected}
        error={error}
        onChange={(nextValue) => onChange(nextValue)}
      />
    );
  }

  return (
    <FileUploadField
      label={question.question}
      required={question.required}
      disabled={disabled}
      error={error}
      multiple={false}
      accept={ADMIN_IMAGE_UPLOAD_ACCEPT}
      maxFileSize={ADMIN_IMAGE_UPLOAD_MAX_BYTES}
      onFilesChange={(files) => onChange(files[0] ?? null)}
    />
  );
}
