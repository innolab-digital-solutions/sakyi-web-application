import { describe, expect, it } from 'vitest';

import {
  buildSaveSectionPayload,
  hydrateDraftAnswersFromSections,
} from '@/domains/onboarding/mappers/admin';
import type { OnboardingIntakeSection } from '@/domains/onboarding/types/admin';

const sectionFixture: OnboardingIntakeSection = {
  id: 10,
  title: 'Profile',
  description: null,
  sort_order: 1,
  questions: [
    {
      id: 100,
      question: 'Name',
      key: 'name',
      type: 'text',
      required: true,
      options: null,
      answer: { value: 'Alice' },
    },
    {
      id: 101,
      question: 'Goals',
      key: 'goals',
      type: 'multiselect',
      required: false,
      options: [{ label: 'A', value: 'a' }],
      answer: { values: ['a'] },
    },
  ],
};

describe('onboarding mapper', () => {
  it('hydrates draft answers from intake sections', () => {
    const draft = hydrateDraftAnswersFromSections([sectionFixture]);
    expect(draft[10][100]).toBe('Alice');
    expect(draft[10][101]).toEqual(['a']);
  });

  it('normalizes section draft to save payload', () => {
    const payload = buildSaveSectionPayload(sectionFixture, {
      100: 'Bob',
      101: ['a'],
    });

    expect(payload.answers).toEqual([
      { question_id: 100, answer: 'Bob', file: null },
      { question_id: 101, answer: ['a'], file: null },
    ]);
  });
});
