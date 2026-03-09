import { Copyright } from 'lucide-react';

const LoginFooter = () => {
  return (
    <div className='absolute bottom-6 left-1/2 w-full -translate-x-1/2 transform'>
      <p className='text-muted-foreground flex w-full items-center justify-center space-x-1 text-xs font-semibold'>
        <Copyright className='h-4 w-4' />
        <span>2026 SaKyi Health & Wellness. All rights reserved.</span>
      </p>
    </div>
  );
};

export default LoginFooter;
