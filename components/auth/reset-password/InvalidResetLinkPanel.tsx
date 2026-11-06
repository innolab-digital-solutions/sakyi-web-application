import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export default function InvalidResetLinkPanel() {
  return (
    <div className='flex flex-col gap-6'>
      <div className='flex gap-4'>
        <div className='bg-destructive/10 text-destructive flex size-12 shrink-0 items-center justify-center rounded-xl'>
          <AlertTriangle className='size-6' aria-hidden />
        </div>
        <div className='min-w-0 space-y-2 text-left'>
          <h1 className='text-foreground text-xl font-bold tracking-tight sm:text-2xl'>
            This reset link is not usable
          </h1>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            The page needs both a valid token and email from your message. If
            the link is old, it may have expired—open the latest email or
            request a new reset from your team.
          </p>
        </div>
      </div>

      <Button
        variant='secondary'
        size='lg'
        className='h-11 w-full normal-case'
        asChild
      >
        <Link href={ROUTES.ADMIN.AUTH.LOGIN}>Go to sign in</Link>
      </Button>
    </div>
  );
}
