'use client';

import { ArrowRight, LogOut, LogOutIcon } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
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
      <AlertDialogContent
        size='sm'
        className='border-border shadow-sm data-[size=sm]:sm:max-w-sm'
      >
        <AlertDialogHeader>
          <AlertDialogMedia className='bg-destructive/10 size-12'>
            <LogOutIcon className='text-destructive size-5' />
          </AlertDialogMedia>
          <AlertDialogTitle className='text-md text-foreground/90'>
            Log out Confirmation
          </AlertDialogTitle>
          <AlertDialogDescription className='text-sm font-medium'>
            Are you sure you want to log out of your account?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className='bg-muted-foreground/10 hover:bg-muted-foreground/20 border-foreground/10 cursor-pointer'>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant='destructive'
            className='cursor-pointer'
            onClick={() => logout()}
          >
            Log out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutConfirmationDialog;
