import { Copyright } from 'lucide-react';
import { PropsWithChildren } from 'react';

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <main className='bg-background relative flex min-h-screen items-center justify-center p-5'>
      <div className='relative z-10 mx-auto w-full max-w-6xl'>
        <div className='bg-background border-border overflow-hidden rounded-lg border p-0 shadow-lg backdrop-blur-xl'>
          {children}
        </div>
      </div>

      <div className='absolute bottom-6 left-1/2 w-full -translate-x-1/2 transform'>
        <p className='text-muted-foreground flex w-full items-center justify-center space-x-1 text-xs font-semibold'>
          <Copyright className='h-4 w-4' />
          <span>2026 SaKyi Health & Wellness. All rights reserved.</span>
        </p>
      </div>
    </main>
  );
};

export default AuthLayout;
