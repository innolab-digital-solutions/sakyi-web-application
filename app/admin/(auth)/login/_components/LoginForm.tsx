'use client';

import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SyntheticEvent } from 'react';

import SubmitButton from '@/components/shared/form/SubmitButton';
import TextField from '@/components/shared/form/TextField';
import { ENDPOINTS } from '@/config/api/endpoints';
import { ROUTES } from '@/config/routes';
import { LoginSchema } from '@/domains/auth/login.schema';
import { useForm } from '@/lib/form';

const LoginForm = () => {
  const router = useRouter();

  const form = useForm(
    {
      email: '',
      password: '',
    },
    {
      schema: LoginSchema,
    },
  );

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    form.post(ENDPOINTS.ADMIN.AUTH.LOGIN, {
      onSuccess: () => {
        router.replace(ROUTES.ADMIN.MODULES.OVERVIEW);
      },
      onFailure: (error) => {
        form.setError('email', error.message);
      },
    });
  };
  return (
    <form className='space-y-3 md:space-y-4' onSubmit={handleSubmit}>
      {/* Email Address Input */}
      <TextField
        label='Email Address'
        id='email'
        name='email'
        type='text'
        placeholder='Enter your email address'
        required
        value={String(form.fields.email ?? '')}
        onChange={(event) => form.setData('email', event.target.value)}
        error={form.errors.email as string}
        disabled={form.isSubmitting}
      />

      {/* Password Input */}
      <TextField
        label='Password'
        id='password'
        name='password'
        type='password'
        placeholder='Enter your password'
        required
        value={String(form.fields.password ?? '')}
        onChange={(event) => form.setData('password', event.target.value)}
        error={form.errors.password as string}
        disabled={form.isSubmitting}
      />

      {/* Submit Button */}
      <SubmitButton isSubmitting={form.isSubmitting}>
        <span>Sign In</span>
        <ArrowRight className='size-4 transition-transform duration-200 group-hover:translate-x-1' />
      </SubmitButton>
    </form>
  );
};

export default LoginForm;
