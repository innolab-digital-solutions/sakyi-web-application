import { describe, expect, it } from 'vitest';

import {
  buildSaveSectionFormData,
  buildSaveSectionPayload,
  findResumeSectionId,
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
  it('finds resume section as first with missing required answers', () => {
    const sections = [
      {
        ...sectionFixture,
        id: 1,
        sort_order: 1,
        questions: [
          {
            id: 100,
            question: 'Name',
            key: 'name',
            type: 'text' as const,
            required: true,
            options: null,
            answer: { value: 'Done' },
          },
        ],
      },
      {
        ...sectionFixture,
        id: 2,
        title: 'Next',
        sort_order: 2,
        questions: [
          {
            id: 200,
            question: 'City',
            key: 'city',
            type: 'text' as const,
            required: true,
            options: null,
            answer: null,
          },
        ],
      },
    ];

    const draft = hydrateDraftAnswersFromSections(sections);
    expect(findResumeSectionId(sections, draft)).toBe(2);
  });

  it('returns last section when all required are satisfied', () => {
    const draft = hydrateDraftAnswersFromSections([sectionFixture]);
    expect(findResumeSectionId([sectionFixture], draft)).toBe(10);
  });

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
      { question_id: 100, answer: 'Bob' },
      { question_id: 101, answer: ['a'] },
    ]);
  });

  it('omits file questions from payload when there is no new upload', () => {
    const withFile: OnboardingIntakeSection = {
      id: 10,
      title: 'Documents',
      description: null,
      sort_order: 1,
      questions: [
        {
          id: 200,
          question: 'ID document',
          key: 'id_doc',
          type: 'file',
          required: true,
          options: null,
          answer: { path: '/storage/id.pdf' },
        },
        {
          id: 201,
          question: 'Notes',
          key: 'notes',
          type: 'text',
          required: true,
          options: null,
          answer: null,
        },
      ],
    };
    const draft = hydrateDraftAnswersFromSections([withFile]);
    const sectionDraft = { ...draft[10], 201: 'Call notes' };
    const payload = buildSaveSectionPayload(withFile, sectionDraft);

    expect(payload.answers).toEqual([
      { question_id: 201, answer: 'Call notes' },
    ]);
  });

  it('buildSaveSectionFormData never appends file for text-only rows', () => {
    const form = buildSaveSectionFormData({
      answers: [
        { question_id: 1, answer: 'a' },
        { question_id: 2, answer: ['x', 'y'] },
      ],
    });
    const keys = [...form.keys()];
    expect(keys.some((key) => key.includes('file'))).toBe(false);
    expect(keys).toContain('answers[0][question_id]');
    expect(keys).toContain('answers[0][answer]');
  });

  it('buildSaveSectionFormData appends a real file only for upload rows', () => {
    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    const form = buildSaveSectionFormData({
      answers: [{ question_id: 9, answer: null, file }],
    });
    const keys = [...form.keys()];
    expect(keys.filter((key) => key === 'answers[0][file]').length).toBe(1);
  });
});
