import type { PropsWithChildren } from 'react';

/**
 * Thin elevated card used only on the public reset-password route so it stays
 * visually separate from the two-column admin sign-in shell.
 */
export function ResetPasswordSurface({ children }: PropsWithChildren) {
  return (
    <div className='relative w-full max-w-md'>
      <div
        aria-hidden
        className='from-primary/20 to-accent/15 pointer-events-none absolute -inset-px rounded-lg bg-linear-to-br via-transparent opacity-80 blur-2xl'
      />
      <div className='border-border bg-card/95 relative overflow-hidden rounded-md border p-8 shadow-xs backdrop-blur-sm sm:p-10'>
        {children}
      </div>
    </div>
  );
}
