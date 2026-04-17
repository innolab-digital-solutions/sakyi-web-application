'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import FormSubmitButton from '@/components/shared/form/FormSubmitButton';
import TextAreaField from '@/components/shared/form/TextAreaField';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ENDPOINTS } from '@/config/api/endpoints';
import { ROUTES } from '@/config/routes';
import { OnboardingIntakeCreateSchema } from '@/domains/onboarding/schemas';
import { getOnboardingTemplateByVersion } from '@/domains/onboarding/services';
import { useForm } from '@/lib/form';

export default function IntakeCreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm(
    {
      enrollment_request_id: '',
      onboarding_template_id: '',
      notes: '',
    },
    {
      schema: OnboardingIntakeCreateSchema,
    },
  );

  const templateQuery = useQuery({
    queryKey: ['onboarding', 'template', 'initial'],
    queryFn: () => getOnboardingTemplateByVersion(1),
  });

  useEffect(() => {
    if (templateQuery.data?.status !== 'success') return;
    const templateId = String(templateQuery.data.data.id);
    if (form.fields.onboarding_template_id === templateId) return;
    form.setData('onboarding_template_id', templateId);
    // Keep template id synced to active template response.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateQuery.data]);

  const enrollmentRequestId = useMemo(() => {
    const value = searchParams.get('request')?.trim();
    if (!value) return null;
    if (!/^\d+$/.test(value)) return null;
    return value;
  }, [searchParams]);

  useEffect(() => {
    if (!enrollmentRequestId) return;
    if (form.fields.enrollment_request_id === enrollmentRequestId) return;

    form.setData('enrollment_request_id', enrollmentRequestId);
    if (form.errors.enrollment_request_id)
      form.clearErrors('enrollment_request_id');
    // Sync enrollment request id from URL as source-of-truth for intake creation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentRequestId]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!enrollmentRequestId) {
      setFormError(
        'Missing enrollment request. Start intake from the request list.',
      );
      return;
    }

    if (templateQuery.data?.status !== 'success' || templateQuery.isFetching) {
      setFormError('Template could not be loaded. Please try again.');
      return;
    }

    void form.post(ENDPOINTS.ADMIN.MODULES.ONBOARDING.INTAKES.CREATE, {
      onSuccess: (response) => {
        const intakeId =
          response &&
          typeof response === 'object' &&
          'data' in response &&
          response.data &&
          typeof response.data === 'object' &&
          'id' in response.data
            ? String(response.data.id)
            : null;

        toast.success('Intake created.');
        if (!intakeId) {
          router.push(ROUTES.ADMIN.MODULES.ONBOARDING.INTAKES.LIST);
          return;
        }
        router.push(
          ROUTES.ADMIN.MODULES.ONBOARDING.INTAKES.INTERVIEW(intakeId),
        );
      },
      onFailure: (error) => {
        setFormError(error.message || 'Could not create intake.');
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Who is this session for?</CardTitle>
        <CardDescription>
          Creates the intake record, then opens the questionnaire. You can
          return anytime from the intake list.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {!enrollmentRequestId && (
            <p className='text-destructive text-sm'>
              Invalid or missing enrollment request. Go back to Enrollment
              Requests and start intake from a specific request.
            </p>
          )}

          <input
            type='hidden'
            name='enrollment_request_id'
            value={
              typeof form.fields.enrollment_request_id === 'string'
                ? form.fields.enrollment_request_id
                : ''
            }
            readOnly
          />

          <TextAreaField
            label='Notes'
            name='notes'
            value={
              typeof form.fields.notes === 'string' ? form.fields.notes : ''
            }
            onChange={(event) => form.setData('notes', event.target.value)}
            error={form.errors.notes}
          />

          {templateQuery.isPending && (
            <p className='text-muted-foreground text-xs'>Loading template...</p>
          )}
          {templateQuery.data?.status === 'success' && (
            <p className='text-muted-foreground text-xs'>
              Using template: {templateQuery.data.data.title}
            </p>
          )}
          {formError && <p className='text-destructive text-sm'>{formError}</p>}

          <FormSubmitButton
            isSubmitting={form.isSubmitting || templateQuery.isFetching}
            disabled={!enrollmentRequestId}
          >
            Create intake
          </FormSubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
