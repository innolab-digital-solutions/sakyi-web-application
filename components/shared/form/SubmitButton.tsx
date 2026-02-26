import type { ComponentProps } from 'react';

import { Button as ShadCNButton } from '@/components/ui/button';
import { Spinner as ShadCNSpinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils/styles';

type FormButtonProps = ComponentProps<typeof ShadCNButton> & {
  processing?: boolean;
};

const SubmitButton = ({ processing, ...props }: FormButtonProps) => {
  return (
    <ShadCNButton
      type='submit'
      className={cn(
        'group from-primary to-accent hover:from-primary/90 hover:to-accent/90 relative flex h-10 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden bg-linear-to-r text-xs font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl md:h-12 md:text-sm',
        props.className,
      )}
      {...props}
    >
      <div className='absolute inset-0 -translate-x-full bg-linear-to-r from-white/10 to-white/5 transition-transform duration-700 ease-out group-hover:translate-x-full' />
      {processing ? (
        <>
          <ShadCNSpinner />
          <span className='ml-1'>Submitting...</span>
        </>
      ) : (
        props.children
      )}
    </ShadCNButton>
  );
};

export default SubmitButton;
