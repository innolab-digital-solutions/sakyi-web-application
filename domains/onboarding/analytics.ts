type OnboardingAnalyticsEvent =
  | 'onboarding_section_save_success'
  | 'onboarding_section_save_error'
  | 'onboarding_complete_success'
  | 'onboarding_complete_error'
  | 'onboarding_cancel_success'
  | 'onboarding_cancel_error';

type OnboardingAnalyticsPayload = {
  intakeId: number;
  sectionId?: number;
  status?: string;
  message?: string;
};

/**
 * Lightweight telemetry hook. Emits a browser event for analytics integration.
 */
export function trackOnboardingEvent(
  event: OnboardingAnalyticsEvent,
  payload: OnboardingAnalyticsPayload,
): void {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent('sakyi:onboarding:analytics', {
      detail: {
        event,
        payload,
      },
    }),
  );
}
