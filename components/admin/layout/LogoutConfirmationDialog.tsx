'use client';

import { ArrowRight, CircleQuestionMark, LogOut } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const LogoutConfirmationDialog = () => {
  const { logout, isLoading } = useAuth();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='hover:text-sidebar-primary-foreground w-full cursor-pointer! justify-between px-3 py-5 hover:bg-white/15'
          disabled={isLoading}
        >
          <div className='flex items-center gap-2'>
            <LogOut className='h-4 w-4 shrink-0' />
            <span className='text-[12.5px] font-semibold'>Logout</span>
          </div>
          <ArrowRight className='h-4 w-4 shrink-0' />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className='gap-0 overflow-hidden p-0 sm:max-w-md'>
        <AlertDialogHeader className='border-border border-b p-6'>
          <div className='flex items-start gap-3'>
            <div className='border-destructive/25 bg-destructive/10 text-destructive mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md border'>
              <CircleQuestionMark className='size-5' aria-hidden />
            </div>
            <div className='space-y-1.5'>
              <AlertDialogTitle className='text-foreground text-sm font-bold capitalize'>
                Sign out of the dashboard?
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground text-[13px] font-medium'>
                Your current session will end. Sign in again anytime to return
                to the admin console.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className='bg-muted/30 border-border gap-2 border-t p-4 sm:justify-end'>
          <AlertDialogCancel
            disabled={isLoading}
            className='text-foreground bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            Stay signed in
          </AlertDialogCancel>
          <Button
            type='button'
            disabled={isLoading}
            variant='destructive'
            className='border-destructive/45 h-10 cursor-pointer gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
            onClick={() => void logout()}
          >
            <LogOut className='size-3.5' />
            {isLoading ? 'Signing out…' : 'Sign out'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutConfirmationDialog;
