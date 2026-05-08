import Image from 'next/image';

import ResetPasswordForm from './ResetPasswordForm';

type ResetPasswordPanelProps = {
  token: string;
  email: string;
};

const ResetPasswordPanel = ({ token, email }: ResetPasswordPanelProps) => {
  return (
    <>
      <header className='mb-8 flex flex-col items-center gap-4 text-center'>
        <Image
          src='/images/logo-3d.png'
          alt='SaKyi Health & Wellness'
          width={75}
          height={75}
          className='rounded-lg object-contain'
          priority
        />
        <div className='space-y-2'>
          <h1 className='text-foreground text-lg font-bold tracking-tight'>
            Reset your password
          </h1>
          <p className='text-muted-foreground text-sm leading-relaxed font-medium'>
            Please choose a strong new password to enhance your account
            security. Once updated, you’ll need to use your new password to sign
            in.
          </p>
        </div>
      </header>

      <ResetPasswordForm token={token} email={email} />
    </>
  );
};

export default ResetPasswordPanel;
