'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import type { ComboboxOption } from '@/components/shared/form/ComboBoxField';
import ComboBoxField from '@/components/shared/form/ComboBoxField';
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
import { getLookupClients } from '@/domains/client/services';
import { OnboardingIntakeCreateSchema } from '@/domains/onboarding/schemas';
import {
  getOnboardingTemplateByVersion,
} from '@/domains/onboarding/services';
import { useForm } from '@/lib/form';

export default function IntakeCreateForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm(
    {
      user_id: '',
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

  const clientsQuery = useQuery({
    queryKey: ['lookup', 'clients'],
    queryFn: () => getLookupClients(),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (templateQuery.data?.status !== 'success') return;
    const templateId = String(templateQuery.data.data.id);
    if (form.fields.onboarding_template_id === templateId) return;
    form.setData('onboarding_template_id', templateId);
    // Keep template id synced to active template response.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateQuery.data]);

  const clientOptions = useMemo((): ComboboxOption[] => {
    const list =
      clientsQuery.data?.status === 'success' ? clientsQuery.data.data : [];
    return list.map((client) => {
      const primary =
        client.name?.trim() || client.email?.trim() || `Client #${client.id}`;
      return {
        value: String(client.id),
        label: primary,
        keywords: [client.email, client.phone, String(client.id)].filter(
          (part): part is string => Boolean(part && String(part).trim()),
        ),
        content: (
          <span className='flex min-w-0 flex-col gap-0.5 text-left'>
            <span className='text-foreground leading-tight font-medium'>
              {client.name || primary}
            </span>
            <span className='text-muted-foreground text-xs leading-tight font-normal'>
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
        router.push(ROUTES.ADMIN.MODULES.ONBOARDING.INTAKES.INTERVIEW(intakeId));
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

          {clientsQuery.data?.status === 'success' &&
            clientOptions.length === 0 && (
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
