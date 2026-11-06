// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import OnboardingQuestionField from '@/components/admin/modules/onboarding/OnboardingQuestionField';
import type { OnboardingIntakeQuestion } from '@/domains/onboarding/types';

const onChange = vi.fn();

function makeQuestion(
  overrides: Partial<OnboardingIntakeQuestion>,
): OnboardingIntakeQuestion {
  return {
    id: 1,
    question: 'Sample',
    key: 'sample',
    type: 'text',
    required: false,
    options: null,
    answer: null,
    ...overrides,
  };
}

describe('OnboardingQuestionField', () => {
  it('renders text input for text question type', () => {
    render(
      <OnboardingQuestionField
        question={makeQuestion({ type: 'text', question: 'Full name' })}
        value=''
        onChange={onChange}
      />,
    );
    expect(screen.getByLabelText('Full name')).toBeTruthy();
  });

  it('renders select for single select type', () => {
    render(
      <OnboardingQuestionField
        question={makeQuestion({
          type: 'select',
          question: 'Gender',
          options: [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
          ],
        })}
        value='male'
        onChange={onChange}
      />,
    );

    expect(screen.getByLabelText('Gender')).toBeTruthy();
  });

  it('renders file input for file question type', () => {
    render(
      <OnboardingQuestionField
        question={makeQuestion({ type: 'file', question: 'Attachment' })}
        value={null}
        onChange={onChange}
      />,
    );

    expect(screen.getByLabelText('Attachment')).toBeTruthy();
  });
});
