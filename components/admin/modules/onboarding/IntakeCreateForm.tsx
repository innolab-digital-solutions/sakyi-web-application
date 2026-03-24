'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import type { ComboboxOption } from '@/components/shared/form/ComboBoxField';
import ComboBoxField from '@/components/shared/form/ComboBoxField';
import FormSubmitButton from '@/components/shared/form/FormSubmitButton';
import TextAreaField from '@/components/shared/form/TextAreaField';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/config/routes';
import { getLookupClients } from '@/domains/client/services/lookup.service';
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

  const clientsQuery = useQuery({
    queryKey: ['lookup', 'clients'],
    queryFn: () => getLookupClients(),
    staleTime: 60_000,
  });

  const clientOptions = useMemo((): ComboboxOption[] => {
    const list =
      clientsQuery.data?.status === 'success' ? clientsQuery.data.data : [];
    return list.map((client) => {
      const primary =
        client.name?.trim() ||
        client.email?.trim() ||
        `Client #${client.id}`;
      return {
        value: String(client.id),
        label: primary,
        keywords: [client.email, client.phone, String(client.id)].filter(
          (part): part is string => Boolean(part && String(part).trim()),
        ),
        content: (
          <span className='flex min-w-0 flex-col gap-0.5 text-left'>
            <span className='text-foreground font-medium leading-tight'>
              {client.name || primary}
            </span>
            <span className='text-muted-foreground text-xs font-normal leading-tight'>
              {client.email}
            </span>
          </span>
        ),
        selectedDisplay: (
          <span className='flex min-w-0 flex-col gap-0.5 text-left'>
            <span className='leading-tight font-medium'>
              {client.name || primary}
            </span>
            <span className='text-muted-foreground text-xs leading-tight'>
              {client.email}
            </span>
          </span>
        ),
      };
    });
  }, [clientsQuery.data]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    form.clearErrors();

    const userIdValue =
      typeof form.fields.user_id === 'string' ? form.fields.user_id.trim() : '';
    const userId = Number.parseInt(userIdValue, 10);
    if (!Number.isInteger(userId) || userId <= 0) {
      form.setError('user_id', 'Select a client.');
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
          {clientsQuery.isError && (
            <p className='text-destructive text-sm'>
              Could not load clients. Refresh the page or try again later.
            </p>
          )}

          <ComboBoxField
            label='Client'
            name='user_id'
            required
            placeholder='Search by name or email…'
            searchPlaceholder='Name, email, or phone…'
            emptyMessage='No clients match your search.'
            options={clientOptions}
            disabled={
              clientsQuery.isPending ||
              clientsQuery.isError ||
              clientOptions.length === 0
            }
            value={
              typeof form.fields.user_id === 'string' &&
              form.fields.user_id.trim() !== ''
                ? form.fields.user_id.trim()
                : null
            }
            onChange={(next) => {
              form.setData('user_id', next ?? '');
              if (form.errors.user_id) form.clearErrors('user_id');
            }}
            error={form.errors.user_id}
          />

          {clientsQuery.data?.status === 'success' && clientOptions.length === 0 && (
            <p className='text-muted-foreground text-xs'>
              No clients available for this lookup.
            </p>
          )}

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
            isSubmitting={
              form.isSubmitting ||
              templateQuery.isFetching ||
              clientsQuery.isFetching
            }
          >
            Create intake
          </FormSubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
