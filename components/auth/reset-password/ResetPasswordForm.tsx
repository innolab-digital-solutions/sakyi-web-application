'use client';

import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SyntheticEvent } from 'react';

import FormSubmitButton from '@/components/shared/form/FormSubmitButton';
import TextField from '@/components/shared/form/TextField';
import { ENDPOINTS } from '@/config/api/endpoints';
import { ROUTES } from '@/config/routes';
import { ResetPasswordSchema } from '@/domains/auth/schemas';
import { useForm } from '@/lib/form';

import { RESET_PASSWORD_SUCCESS_MARKER_KEY } from './constants';

type ResetPasswordFormProps = {
  token: string;
  email: string;
};

const ResetPasswordForm = ({ token, email }: ResetPasswordFormProps) => {
  const router = useRouter();

  const form = useForm(
    {
      token,
      email,
      password: '',
      password_confirmation: '',
    },
    {
      schema: ResetPasswordSchema,
    },
  );

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    form.post(ENDPOINTS.ADMIN.AUTH.RESET_PASSWORD, {
      onSuccess: () => {
        sessionStorage.setItem(
          RESET_PASSWORD_SUCCESS_MARKER_KEY,
          String(Date.now()),
        );
        router.replace(ROUTES.ADMIN.AUTH.RESET_PASSWORD_SUCCESS);
      },
      onFailure: (error) => {
        form.setError('email', error.message);
      },
    });
  };

  return (
    <form className='space-y-4' onSubmit={handleSubmit}>
      <TextField
        label='Account email'
        id='email'
        name='email'
        type='email'
        autoComplete='email'
        readOnly
        value={String(form.fields.email ?? '')}
        error={form.errors.email as string}
        disabled={form.isSubmitting}
      />

      <TextField
        label='New password'
        id='password'
        name='password'
        type='password'
        autoComplete='new-password'
        placeholder='Create a strong password'
        required
        passwordVisibilityToggle={true}
        value={String(form.fields.password ?? '')}
        onChange={(event) => form.setData('password', event.target.value)}
        error={form.errors.password as string}
        disabled={form.isSubmitting}
      />

      <TextField
        label='Confirm password'
        id='password_confirmation'
        name='password_confirmation'
        type='password'
        autoComplete='new-password'
        placeholder='Type it again to confirm'
        required
        passwordVisibilityToggle={true}
        value={String(form.fields.password_confirmation ?? '')}
        onChange={(event) =>
          form.setData('password_confirmation', event.target.value)
        }
        error={form.errors.password_confirmation as string}
        disabled={form.isSubmitting}
      />

      <FormSubmitButton isSubmitting={form.isSubmitting}>
        <span>Save new password</span>
        <ArrowRight className='size-4 transition-transform duration-200 group-hover:translate-x-1' />
      </FormSubmitButton>
    </form>
  );
};

export default ResetPasswordForm;
