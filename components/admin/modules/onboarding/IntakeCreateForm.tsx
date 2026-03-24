'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import FormSubmitButton from '@/components/shared/form/FormSubmitButton';
import TextAreaField from '@/components/shared/form/TextAreaField';
import TextField from '@/components/shared/form/TextField';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/config/routes';
import {
  createOnboardingIntake,
  getOnboardingTemplateByVersion,
} from '@/domains/onboarding/services/admin.service';
import { useForm } from '@/lib/form';
import type { ApiError } from '@/types/api';

export default function IntakeCreateForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm(
    {
      user_id: '',
      notes: '',
    },
    {},
  );

  const templateQuery = useQuery({
    queryKey: ['onboarding', 'template', 'initial'],
    queryFn: () => getOnboardingTemplateByVersion(1),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    form.clearErrors();

    const userIdValue =
      typeof form.fields.user_id === 'string' ? form.fields.user_id : '';
    const userId = Number.parseInt(userIdValue, 10);
    if (!Number.isInteger(userId) || userId <= 0) {
      form.setError('user_id', 'User ID must be a valid positive integer.');
      return;
    }

    if (templateQuery.data?.status !== 'success') {
      setFormError('Template could not be loaded. Please try again.');
      return;
    }

    const onboardingTemplateID = templateQuery.data.data.id;

    const notesValue =
      typeof form.fields.notes === 'string' ? form.fields.notes : '';

    void createOnboardingIntake({
      user_id: userId,
      onboarding_template_id: onboardingTemplateID,
      notes: notesValue.trim() || undefined,
    }).then((response) => {
      if (response.status === 'error') {
        const fieldErrors = (response as ApiError).errors;
        if (fieldErrors && typeof fieldErrors === 'object') {
          const userError = fieldErrors.user_id;
          if (typeof userError === 'string') {
            form.setError('user_id', userError);
          } else if (
            Array.isArray(userError) &&
            typeof userError[0] === 'string'
          ) {
            form.setError('user_id', userError[0]);
          }

          const notesError = fieldErrors.notes;
          if (typeof notesError === 'string') {
            form.setError('notes', notesError);
          } else if (
            Array.isArray(notesError) &&
            typeof notesError[0] === 'string'
          ) {
            form.setError('notes', notesError[0]);
          }

          const templateError = fieldErrors.onboarding_template_id;
          if (typeof templateError === 'string') {
            setFormError(templateError);
            return;
          }
          if (
            Array.isArray(templateError) &&
            typeof templateError[0] === 'string'
          ) {
            setFormError(templateError[0]);
            return;
          }
        }

        setFormError(response.message);
        return;
      }

      toast.success('Intake created.');
      router.push(
        ROUTES.ADMIN.MODULES.ONBOARDING.INTAKES.WIZARD(
          String(response.data.id),
        ),
      );
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Start onboarding intake</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <TextField
            label='Client user ID'
            name='user_id'
            type='number'
            required
            value={
              typeof form.fields.user_id === 'string' ? form.fields.user_id : ''
            }
            onChange={(event) => form.setData('user_id', event.target.value)}
            error={form.errors.user_id}
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
          >
            Create intake
          </FormSubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
