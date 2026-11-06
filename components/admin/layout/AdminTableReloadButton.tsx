'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Loader2Icon, RotateCwIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/styles';

type AdminTableReloadButtonProps = {
  className?: string;
};

const RELOAD_COOLDOWN_SECONDS = 10;

export default function AdminTableReloadButton({
  className,
}: AdminTableReloadButtonProps) {
  const queryClient = useQueryClient();
  const [isReloading, setIsReloading] = useState(false);
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0);

  useEffect(() => {
    if (cooldownSecondsLeft <= 0) return;
    const timerId = window.setTimeout(() => {
      setCooldownSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearTimeout(timerId);
  }, [cooldownSecondsLeft]);

  const handleReload = async () => {
    if (isReloading || cooldownSecondsLeft > 0) return;
    setIsReloading(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: ['table'],
        refetchType: 'active',
      });
      toast.success('The table data has been refreshed.');
      setCooldownSecondsLeft(RELOAD_COOLDOWN_SECONDS);
    } catch {
      toast.error('Failed to refresh table data.');
    } finally {
      setIsReloading(false);
    }
  };

  const isDisabled = isReloading || cooldownSecondsLeft > 0;

  return (
    <Button
      type='button'
      variant='outline'
      size='default'
      className={cn(
        'bg-background h-11 rounded-md border-neutral-200 px-3 text-[13px] font-semibold text-neutral-700 shadow-none hover:border-neutral-300 hover:bg-neutral-50',
        className,
      )}
      onClick={handleReload}
      disabled={isDisabled}
      aria-busy={isReloading}
    >
      {isReloading ? (
        <Loader2Icon className='size-3.5 animate-spin' />
      ) : (
        <RotateCwIcon className='size-3.5' />
      )}
      {cooldownSecondsLeft > 0 ? `Reload (${cooldownSecondsLeft}s)` : 'Reload'}
    </Button>
  );
}
