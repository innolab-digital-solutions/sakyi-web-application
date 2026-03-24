import type { ApiError } from '@/types/api';

import type {
  OnboardingIntakeSection,
  OnboardingQuestionAnswerValue,
  OnboardingQuestionType,
  SaveOnboardingSectionAnswerInput,
  SaveOnboardingSectionPayload,
} from '../types/admin';

export type DraftAnswerValue = string | number | string[] | number[] | File | null;
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
        answers[question.id] = normalizeApiAnswerValue(question.type, question.answer);
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
  return Object.keys(getRequiredFieldErrorsForSection(section, sectionDraft)).length === 0;
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
 */
export function buildSaveSectionPayload(
  section: OnboardingIntakeSection,
  sectionDraft: SectionDraftAnswers,
): SaveOnboardingSectionPayload {
  const answers = section.questions.reduce<SaveOnboardingSectionAnswerInput[]>(
    (result, question) => {
      const value = sectionDraft[question.id];
      if (value === undefined) return result;

      if (question.type === 'file') {
        result.push({
          question_id: question.id,
          answer: null,
          file: value instanceof File ? value : null,
        });
        return result;
      }

      result.push({
        question_id: question.id,
        answer: normalizeScalarForPayload(value),
        file: null,
      });

      return result;
    },
    [],
  );

  return { answers };
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
      return values.filter((value) => ['string', 'number'].includes(typeof value)) as
        | string[]
        | number[];
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
