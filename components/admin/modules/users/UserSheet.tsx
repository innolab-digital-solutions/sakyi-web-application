'use client';

import { PlusIcon } from 'lucide-react';
import { useState } from 'react';

import UserForm from '@/components/admin/modules/users/UserForm';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { User } from '@/domains/user/types';

type CreateProps = {
  mode: 'create';
  user?: never;
  open?: never;
  onOpenChange?: never;
};

type EditProps = {
  mode: 'edit';
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Props = CreateProps | EditProps;

export default function UserSheet({ mode, user, open, onOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isEdit = mode === 'edit';
  const isOpen = isEdit ? open : internalOpen;
  const setOpen = isEdit ? onOpenChange : setInternalOpen;

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      {!isEdit && (
        <SheetTrigger asChild>
          <Button
            type='button'
            className='h-10 shrink-0 gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
          >
            <PlusIcon className='size-3.5' />
            Add Account
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className='w-full overflow-y-auto px-6 sm:max-w-2xl [&>button]:cursor-pointer'>
        <SheetHeader className='px-0'>
          <SheetTitle className='text-foreground text-[15.5px] font-bold capitalize'>
            {isEdit ? 'Edit User Account' : 'Create User Account'}
          </SheetTitle>
          <SheetDescription className='text-muted-foreground text-[13.5px] font-medium'>
            {isEdit
              ? 'Update this user account, role assignment, and access status so platform permissions stay accurate across daily operations.'
              : 'Add a user account with identity details, credentials, role assignment, and an initial access status to support secure operations.'}
          </SheetDescription>
        </SheetHeader>
        {isEdit ? (
          <UserForm
            key={user.id}
            mode='edit'
            userId={user.id}
            onSuccess={() => setOpen(false)}
          />
        ) : (
          <UserForm mode='create' onSuccess={() => setOpen(false)} />
        )}
      </SheetContent>
    </Sheet>
  );
}
