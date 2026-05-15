'use client';

import { ExternalLinkIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils/styles';

/** Matches admin outline actions (e.g. blog post create “Back” button). */
const outlineActionButtonClass =
  'text-foreground bg-background hover:bg-muted h-10 shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold';

/** Max image box: dialog chrome (header, toolbar, padding) subtracted from viewport. */
const evidenceImageFitClass =
  'max-h-[calc(96dvh-14rem)] max-w-[min(100%,calc(96vw-5rem))]';

export type OperationalLogMediaPreviewModalProps = {
  imageUrl: string | null;
  /** Task or log label shown under the title for context. */
  contextLabel?: string | null;
  onOpenChange: (open: boolean) => void;
};

/**
 * Read-only lightbox for operational-log evidence media.
 * Sizes portrait screenshots by height (not a fixed 16:9 frame) so phone captures stay readable.
 */
export default function OperationalLogMediaPreviewModal({
  imageUrl,
  contextLabel,
  onOpenChange,
}: OperationalLogMediaPreviewModalProps) {
  const imageAlt = contextLabel?.trim()
    ? `Evidence media for ${contextLabel.trim()}`
    : 'Operational log evidence media preview';

  return (
    <Dialog open={!!imageUrl} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[96dvh] w-[min(96vw,56rem)] max-w-[min(96vw,56rem)]',
          'flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(96vw,56rem)]',
        )}
      >
        <DialogHeader className='border-border shrink-0 space-y-1 border-b px-5 pt-5 pb-3 text-left sm:px-6 sm:pt-6'>
          <DialogTitle className='text-foreground pr-8 text-[15.5px] font-bold'>
            Log evidence preview
          </DialogTitle>
          {contextLabel?.trim() ? (
            <p className='text-foreground/85 text-[13px] font-semibold'>
              {contextLabel.trim()}
            </p>
          ) : null}
          <DialogDescription className='text-muted-foreground text-[13px] leading-relaxed font-medium'>
            Client-uploaded supporting media for this log entry. Open in a new
            tab if you need the browser&apos;s full-size view.
          </DialogDescription>
        </DialogHeader>

        {imageUrl ? (
          <>
            <div className='border-border/60 flex shrink-0 flex-wrap items-center gap-2 border-b px-5 py-2.5 sm:px-6'>
              <Button
                type='button'
                variant='outline'
                className={outlineActionButtonClass}
                asChild
              >
                <a href={imageUrl} target='_blank' rel='noopener noreferrer'>
                  <ExternalLinkIcon className='size-3.5' aria-hidden />
                  Open in new tab
                </a>
              </Button>
            </div>

            <div className='bg-muted/25 flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 py-4 sm:px-6 sm:py-5'>
              <div
                className={cn(
                  'flex w-full items-center justify-center overflow-hidden',
                  'border-border/80 rounded-md border border-dashed',
                  'bg-muted/15 p-3 sm:p-4',
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={imageAlt}
                  className={cn(
                    'mx-auto block object-contain shadow-md select-none',
                    evidenceImageFitClass,
                  )}
                  draggable={false}
                />
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
