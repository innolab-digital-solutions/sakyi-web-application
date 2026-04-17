'use client';

import FileUploadField from '@/components/shared/form/FileUploadField';
import SelectField from '@/components/shared/form/SelectField';
import TextField from '@/components/shared/form/TextField';
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
        required={question.required}
        type='number'
        disabled={disabled}
        value={
          typeof value === 'number' || typeof value === 'string' ? value : ''
        }
        error={error}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (question.type === 'date') {
    return (
      <TextField
        label={question.question}
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
      maxFileSize={10 * 1024 * 1024}
      onFilesChange={(files) => onChange(files[0] ?? null)}
    />
  );
}
