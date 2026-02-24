'use client';

import { ArrowRight } from 'lucide-react';
import TextField from '@/components/shared/form/TextField';
import SubmitButton from '@/components/shared/form/SubmitButton';
import { LoginSchema } from '@/lib/schema/admin/auth/login';
import { useForm } from '@/hooks/form';
import { ENDPOINTS } from '@/config/endpoints';
import { SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/config/paths';

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
        router.replace(PATHS.ADMIN.DASHBOARD);
      },
      onFailure: (error) => {
        form.setError('email', error.message);
      },
    });
  };
  return (
    <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit}>
      {/* Email Address Input */}
      <TextField
        label="Email Address"
        id="email"
        name="email"
        type="text"
        placeholder="Enter your email address"
        required
        value={String(form.data.email ?? '')}
        onChange={(event) => form.setData('email', event.target.value)}
        error={form.errors.email as string}
        disabled={form.processing}
      />

      {/* Password Input */}
      <TextField
        label="Password"
        id="password"
        name="password"
        type="password"
        placeholder="Enter your password"
        required
        value={String(form.data.password ?? '')}
        onChange={(event) => form.setData('password', event.target.value)}
        error={form.errors.password as string}
        disabled={form.processing}
      />

      {/* Submit Button */}
      <SubmitButton processing={form.processing}>
        <span>Sign In</span>
        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
      </SubmitButton>
    </form>
  );
};

export default LoginForm;
