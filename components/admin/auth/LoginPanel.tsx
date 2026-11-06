import Image from 'next/image';

import LoginForm from './LoginForm';

const LoginPanel = () => {
  return (
    <div className='flex flex-col justify-center bg-white p-6 lg:p-12'>
      {/* Panel header: logo (mobile), welcome message, description */}
      <div className='mb-5 space-y-3 text-center md:mb-10'>
        {/* Logo: visible only on small screens */}
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
        {/* Main heading */}
        <h1 className='text-foreground text-lg font-bold tracking-tight sm:text-2xl'>
          Welcome Back!
        </h1>
        {/* Supporting description */}
        <p className='text-muted-foreground text-xs sm:text-sm'>
          Sign in to securely manage healthcare services and administrative
          operations.
        </p>
      </div>
      {/* Login form component */}
      <LoginForm />
    </div>
  );
};

export default LoginPanel;
