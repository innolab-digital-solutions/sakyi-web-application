'use client';

import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { toast, Toaster } from 'sonner';

import { cn } from '@/lib/utils/styles';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

type ToastOptions = Parameters<typeof toast.success>[1];
type ToastMessage = Parameters<typeof toast.success>[0];

type ToastCardProps = {
  id: string | number;
  title: ReactNode;
  variant: ToastVariant;
  description?: ReactNode;
  durationMs: number;
  onClose?: () => void;
};

const toastIcons: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle2 className='h-4 w-4' />,
  error: <AlertCircle className='h-4 w-4' />,
  info: <Info className='h-4 w-4' />,
  warning: <TriangleAlert className='h-4 w-4' />,
};

const toastIconStyles: Record<ToastVariant, string> = {
  success: 'border border-emerald-200 bg-emerald-50 text-emerald-500',
  error: 'border border-rose-200 bg-rose-50 text-rose-500',
  info: 'border border-sky-200 bg-sky-50 text-sky-500',
  warning: 'border border-amber-200 bg-amber-50 text-amber-500',
};

const toastProgressStyles: Record<ToastVariant, string> = {
  success: 'bg-emerald-500',
  error: 'bg-rose-500',
  info: 'bg-sky-500',
  warning: 'bg-amber-500',
};

const toReactNode = (value: unknown): ReactNode | undefined => {
  if (typeof value === 'function') return undefined;
  if (value === undefined) return undefined;
  return value as ReactNode;
};

const ToastCard = ({
  id,
  title,
  variant,
  description,
  durationMs,
  onClose,
}: ToastCardProps) => {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const closeTriggeredRef = useRef(false);

  useEffect(() => {
    if (durationMs <= 0) return;

    const interval = window.setInterval(() => {
      if (isPaused) return;
      setElapsedMs((previous) => Math.min(durationMs, previous + 20));
    }, 20);

    return () => window.clearInterval(interval);
  }, [durationMs, isPaused]);

  useEffect(() => {
    if (durationMs <= 0 || closeTriggeredRef.current || elapsedMs < durationMs) return;
    closeTriggeredRef.current = true;
    onClose?.();
  }, [durationMs, elapsedMs, onClose]);

  const progress = durationMs > 0 ? (elapsedMs / durationMs) * 100 : 0;

  return (
    <div
      className={cn(
        'border-border pointer-events-auto relative w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-md border bg-white p-4',
      )}
      data-toast-id={id}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className='flex items-start gap-3 pr-7'>
        <div
          className={cn(
            'flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-md',
            toastIconStyles[variant],
          )}
        >
          {toastIcons[variant]}
        </div>
        <div className='min-w-0 flex-1'>
          <p className='mb-1 text-[13px] font-semibold text-neutral-800'>
            {title}
          </p>
          {description ? (
            <p className='text-xs font-medium text-slate-600'>
              {description}
            </p>
          ) : null}
        </div>
        <button
          type='button'
          aria-label='Dismiss notification'
          onClick={onClose}
          className='absolute top-3 right-3 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600'
        >
          <X className='h-4 w-4' />
        </button>
      </div>
      {durationMs > 0 ? (
        <div className='absolute right-0 bottom-0 left-0 h-1.5 border-t border-slate-200/70 bg-slate-100/80'>
          <div
            className={cn('h-full', toastProgressStyles[variant])}
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

const normalizeInput = (
  input: ToastMessage,
  fallback: string,
): { title: ReactNode; description?: ReactNode } => {
  if (typeof input === 'function') {
    return { title: fallback };
  }

  if (typeof input === 'string' && input.trim().length > 0) {
    return { title: input };
  }

  if (input === null || input === undefined || input === false) {
    return { title: fallback };
  }

  return { title: input };
};

const renderHeadlessToast = (
  variant: ToastVariant,
  message: ToastMessage,
  options?: ToastOptions,
) => {
  const durationMs =
    typeof options?.duration === 'number'
      ? Math.max(0, options.duration)
      : 3000;

  const { title, description: messageDescription } = normalizeInput(
    message,
    variant === 'success'
      ? 'Action completed successfully.'
      : variant === 'error'
        ? 'Something went wrong.'
        : variant === 'warning'
          ? 'Please review this notice.'
          : 'Notification',
  );
  const description = toReactNode(options?.description) ?? messageDescription;
  const toasterOptions: ToastOptions = {
    ...options,
    duration: Number.POSITIVE_INFINITY,
  };

  return toast.custom(
    (id) => (
      <ToastCard
        id={id}
        title={title}
        description={description}
        durationMs={durationMs}
        variant={variant}
        onClose={() => toast.dismiss(id)}
      />
    ),
    toasterOptions,
  );
};

let isPatched = false;

const patchToastMethods = () => {
  if (isPatched) return;
  isPatched = true;

  const originalLoading = toast.loading;
  const originalPromise = toast.promise;
  const originalDismiss = toast.dismiss;

  toast.success = (message, options) =>
    renderHeadlessToast('success', message, options);
  toast.error = (message, options) =>
    renderHeadlessToast('error', message, options);
  toast.info = (message, options) =>
    renderHeadlessToast('info', message, options);

  toast.warning = (message, options) => {
    return renderHeadlessToast('warning', message, options);
  };

  toast.message = (message, options) =>
    renderHeadlessToast('info', message, options);

  // Keep original methods available for advanced use-cases if needed.
  toast.loading = originalLoading;
  toast.promise = originalPromise;
  toast.dismiss = originalDismiss;
};

patchToastMethods();

const CustomToastProvider = () => {
  return (
    <Toaster
      position='top-right'
      visibleToasts={4}
      closeButton={false}
      expand={false}
      gap={10}
      offset={24}
      toastOptions={{
        unstyled: true,
        duration: 4200,
      }}
    />
  );
};

export default CustomToastProvider;
