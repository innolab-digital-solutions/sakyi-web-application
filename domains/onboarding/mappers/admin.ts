import type { ApiError } from '@/types/api';

import type {
  OnboardingIntakeSection,
  OnboardingQuestionAnswerValue,
  OnboardingQuestionType,
  SaveOnboardingSectionAnswerInput,
  SaveOnboardingSectionPayload,
} from '../types/admin';

export type DraftAnswerValue =
  | string
  | number
  | string[]
  | number[]
  | File
  | null;
export type SectionDraftAnswers = Record<number, DraftAnswerValue>;
export type DraftBySection = Record<number, SectionDraftAnswers>;

/**
 * Converts API answer payloads to local draft values by section/question id.
 */
export function hydrateDraftAnswersFromSections(
  sections: OnboardingIntakeSection[],
): DraftBySection {
  return sections.reduce<DraftBySection>((draft, section) => {
    const sectionDraft = section.questions.reduce<SectionDraftAnswers>(
      (answers, question) => {
        answers[question.id] = normalizeApiAnswerValue(
          question.type,
          question.answer,
        );
        return answers;
      },
      {},
    );

    draft[section.id] = sectionDraft;
    return draft;
  }, {});
}

/**
 * Returns client-side required-field errors for a section (mirrors interview step validation rules).
 */
export function getRequiredFieldErrorsForSection(
  section: OnboardingIntakeSection,
  sectionDraft: SectionDraftAnswers,
): Record<number, string> {
  const nextErrors: Record<number, string> = {};

  for (const question of section.questions) {
    if (!question.required) continue;

    const draftValue = sectionDraft[question.id];
    const hasExistingServerAnswer = question.answer != null;

    let isMissing = false;

    if (question.type === 'text' || question.type === 'date') {
      const text = typeof draftValue === 'string' ? draftValue.trim() : '';
      isMissing = text.length === 0;
    } else if (question.type === 'number') {
      const numberText =
        typeof draftValue === 'string' || typeof draftValue === 'number'
          ? String(draftValue).trim()
          : '';
      isMissing = numberText.length === 0;
    } else if (question.type === 'select') {
      const selected = typeof draftValue === 'string' ? draftValue.trim() : '';
      isMissing = selected.length === 0;
    } else if (question.type === 'multiselect') {
      const values = Array.isArray(draftValue) ? draftValue : [];
      isMissing = values.length === 0;
    } else if (question.type === 'file') {
      isMissing = !(draftValue instanceof File) && !hasExistingServerAnswer;
    }

    if (isMissing) {
      nextErrors[question.id] = 'This field is required.';
    }
  }

  return nextErrors;
}

/**
 * Whether every required question in the section has a value (API answer and/or draft).
 */
export function isSectionRequiredComplete(
  section: OnboardingIntakeSection,
  sectionDraft: SectionDraftAnswers,
): boolean {
  return (
    Object.keys(getRequiredFieldErrorsForSection(section, sectionDraft))
      .length === 0
  );
}

/**
 * First section that still has missing required answers, otherwise the last section (all complete).
 */
export function findResumeSectionId(
  sections: OnboardingIntakeSection[],
  draftBySection: DraftBySection,
): number | null {
  if (!sections.length) return null;
  for (const section of sections) {
    const draft = draftBySection[section.id] ?? {};
    if (!isSectionRequiredComplete(section, draft)) {
      return section.id;
    }
  }
  return sections[sections.length - 1].id;
}

/**
 * Normalizes section draft values to backend `answers` payload format.
 *
 * - Non-file answers never include a `file` key (avoids `file: null` tripping strict API validation).
 * - File questions are only included when a new {@link File} is selected. Existing server-side uploads
 *   are omitted so we do not resend `{ answer: null, file: null }`, which many backends treat as invalid.
 */
export function buildSaveSectionPayload(
  section: OnboardingIntakeSection,
  sectionDraft: SectionDraftAnswers,
): SaveOnboardingSectionPayload {
  const answers: SaveOnboardingSectionAnswerInput[] = [];

  for (const question of section.questions) {
    const value = sectionDraft[question.id];
    if (value === undefined) continue;

    if (question.type === 'file') {
      if (value instanceof File) {
        answers.push({
          question_id: question.id,
          answer: null,
          file: value,
        });
        continue;
      }
      // No new file: skip — already stored on the server (`question.answer`) or intentionally empty.
      continue;
    }

    answers.push({
      question_id: question.id,
      answer: normalizeScalarForPayload(value),
    });
  }

  return { answers };
}

/**
 * Builds `multipart/form-data` for PUT section save.
 *
 * Laravel cannot validate uploaded files from a JSON body; nested {@link File} values are also
 * lost/`{}`-serialized when passed through `JSON.stringify`. This shape uses nested keys
 * `answers[i][question_id]`, `answers[i][answer]` / `answers[i][answer][]`, and **only** when
 * uploading: `answers[i][file]` — never appends `file` for non-upload rows (avoids “must be a file” 422s).
 */
export function buildSaveSectionFormData(
  payload: SaveOnboardingSectionPayload,
): FormData {
  const form = new FormData();

  payload.answers.forEach((item, index) => {
    form.append(`answers[${index}][question_id]`, String(item.question_id));

    if (item.file instanceof File) {
      form.append(`answers[${index}][file]`, item.file, item.file.name);
    }

    const ans = item.answer;
    if (ans === undefined) {
      return;
    }
    if (ans === null) {
      form.append(`answers[${index}][answer]`, '');
      return;
    }
    if (Array.isArray(ans)) {
      if (ans.length === 0) {
        form.append(`answers[${index}][answer]`, '');
        return;
      }
      for (const entry of ans) {
        form.append(`answers[${index}][answer][]`, String(entry));
      }
      return;
    }
    form.append(`answers[${index}][answer]`, String(ans));
  });

  return form;
}

/**
 * Maps API 422-style field errors into section question-id keyed errors.
 */
export function mapSectionFieldErrorsFromApi(
  error: ApiError,
): Record<number, string> {
  if (!error.errors || typeof error.errors !== 'object') {
    return {};
  }

  return Object.entries(error.errors).reduce<Record<number, string>>(
    (acc, [key, rawMessage]) => {
      const questionIdMatch = key.match(/\d+/);
      if (!questionIdMatch) return acc;

      const questionId = Number.parseInt(questionIdMatch[0], 10);
      if (Number.isNaN(questionId)) return acc;

      const message = normalizeApiErrorMessage(rawMessage);
      if (!message) return acc;

      acc[questionId] = message;
      return acc;
    },
    {},
  );
}

function normalizeApiAnswerValue(
  type: OnboardingQuestionType,
  answer: Record<string, unknown> | null,
): DraftAnswerValue {
  if (!answer) return type === 'multiselect' ? [] : null;

  if (type === 'multiselect') {
    const values = answer.values;
    if (Array.isArray(values)) {
      return values.filter((value) =>
        ['string', 'number'].includes(typeof value),
      ) as string[] | number[];
    }
    return [];
  }

  const scalar = answer.value;
  if (scalar == null) return null;
  if (typeof scalar === 'string' || typeof scalar === 'number') return scalar;
  return null;
}

function normalizeScalarForPayload(
  value: DraftAnswerValue,
): OnboardingQuestionAnswerValue | undefined {
  if (value == null) return null;
  if (Array.isArray(value)) return value as string[] | number[];
  if (value instanceof File) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeApiErrorMessage(raw: unknown): string | null {
  if (Array.isArray(raw) && typeof raw[0] === 'string') return raw[0];
  if (typeof raw === 'string') return raw;
  return null;
}
