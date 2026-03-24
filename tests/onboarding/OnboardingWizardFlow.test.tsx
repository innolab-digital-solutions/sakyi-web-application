// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import OnboardingWizard from '@/components/admin/modules/onboarding/OnboardingWizard';

const replaceMock = vi.fn();
const saveSectionMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: replaceMock }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'admin' } }),
}));

vi.mock('@/domains/onboarding/services/admin.service', () => ({
  getOnboardingIntakeById: async () => ({
    status: 'success',
    message: 'ok',
    data: {
      id: 1,
      status: 'in_progress',
      notes: null,
      user: { id: 1, name: 'Client', email: 'client@example.com' },
      template: {
        id: 2,
        title: 'Template',
        version: 1,
        sections: [
          {
            id: 11,
            title: 'Section A',
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
                answer: null,
              },
            ],
          },
          {
            id: 12,
            title: 'Section B',
            description: null,
            sort_order: 2,
            questions: [
              {
                id: 101,
                question: 'Age',
                key: 'age',
                type: 'number',
                required: false,
                options: null,
                answer: null,
              },
            ],
          },
        ],
      },
      timestamps: { created_at: null, updated_at: null },
    },
    meta: {
      version: 'v1',
      progress: { answered_required: 0, total_required: 1, completion_rate: 0 },
    },
  }),
  saveOnboardingIntakeSection: async (...args: unknown[]) => {
    saveSectionMock(...args);
    return {
      status: 'success',
      message: 'saved',
      data: {
        id: 1,
        status: 'in_progress',
        notes: null,
        timestamps: { created_at: null, updated_at: null },
      },
      meta: {
        version: 'v1',
        progress: {
          answered_required: 0,
          total_required: 1,
          completion_rate: 0,
        },
      },
    };
  },
  completeOnboardingIntake: async () => ({
    status: 'success',
    message: 'completed',
    data: {
      id: 1,
      status: 'completed',
      notes: null,
      timestamps: { created_at: null, updated_at: null },
    },
    meta: {
      version: 'v1',
      progress: {
        answered_required: 1,
        total_required: 1,
        completion_rate: 100,
      },
    },
  }),
  cancelOnboardingIntake: async () => ({
    status: 'success',
    message: 'cancelled',
    data: {
      id: 1,
      status: 'cancelled',
      notes: null,
      timestamps: { created_at: null, updated_at: null },
    },
    meta: {
      version: 'v1',
      progress: {
        answered_required: 1,
        total_required: 1,
        completion_rate: 100,
      },
    },
  }),
}));

describe('OnboardingWizard flow', () => {
  it('saves current section and moves to next step', async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <OnboardingWizard intakeId={1} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Section A')).toBeTruthy();
    });

    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Alice' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => {
      expect(saveSectionMock).toHaveBeenCalled();
    });
  });
});
