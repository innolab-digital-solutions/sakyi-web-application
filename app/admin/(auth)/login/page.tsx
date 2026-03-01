import Image from 'next/image';

import LoginForm from '@/components/admin/auth/LoginForm';
import AuthLayout from '@/components/admin/layouts/AuthLayout';

export default function AdminLoginPage() {
  return (
    <AuthLayout>
      <div className='grid min-h-120 grid-cols-1 md:min-h-150 lg:grid-cols-2'>
        <div className='from-primary via-primary/90 to-accent relative hidden flex-col items-center justify-center overflow-hidden bg-linear-to-br p-8 text-white lg:flex lg:p-12'>
          <div className='relative z-10 text-center'>
            <div className='mb-6 flex items-center justify-center'>
              <Image
                src='/images/logo-white.png'
                alt='SaKyi Health & Wellness Logo'
                width={64}
                height={64}
                className='rounded-md object-contain'
                priority
              />
            </div>

            <div className='space-y-6'>
              <div className='space-y-3'>
                <h1 className='text-xl leading-tight font-bold text-white lg:text-2xl'>
                  SaKyi Health & Wellness
                </h1>
                <div className='mx-auto h-0.5 w-16 rounded-full bg-white/50'></div>
                <p className='text-md font-medium tracking-wide text-white'>
                  Administrative Control Panel
                </p>
              </div>

              <p className='mx-auto max-w-sm text-sm leading-relaxed text-white/80'>
                Delivering innovative solutions to streamline healthcare
                administration and enhance patient care outcomes.
              </p>
            </div>
          </div>
        </div>

        <div className='flex flex-col justify-center bg-white p-6 lg:p-12'>
          <div className='mb-5 space-y-3 text-center md:mb-10'>
            <div className='mb-3 flex items-center justify-center md:mb-6 lg:hidden'>
              <Image
                src='/images/logo.png'
                alt='SaKyi Health & Wellness Logo'
                width={54}
                height={54}
                className='rounded-md object-contain'
                priority
              />
            </div>
            <h1 className='text-foreground text-lg font-bold tracking-tight sm:text-2xl'>
              Welcome Back!
            </h1>
            <p className='text-muted-foreground text-xs sm:text-sm'>
              Sign in to securely manage healthcare services and administrative
              operations.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </AuthLayout>
  );
}
