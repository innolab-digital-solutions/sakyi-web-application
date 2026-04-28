'use client';

import Image from 'next/image';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type OperationalLogMediaPreviewModalProps = {
  imageUrl: string | null;
  onOpenChange: (open: boolean) => void;
};

/**
 * Read-only preview modal for operational-log evidence media.
 */
export default function OperationalLogMediaPreviewModal({
  imageUrl,
  onOpenChange,
}: OperationalLogMediaPreviewModalProps) {
  return (
    <Dialog open={!!imageUrl} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl gap-0 overflow-hidden p-0'>
        <DialogHeader className='border-border border-b px-6 pt-6 pb-4 text-left'>
          <DialogTitle className='text-foreground text-[15.5px] font-bold'>
            Log Evidence Media Preview
          </DialogTitle>
          <DialogDescription className='text-muted-foreground text-[13px] leading-relaxed font-medium'>
            This is the evidence log uploaded by the client as supporting media
            for this operational log entry.
          </DialogDescription>
        </DialogHeader>
        {imageUrl ? (
          <div className='px-6 pt-4 pb-6'>
            <div className='bg-muted/30 relative aspect-video w-full overflow-hidden rounded-md'>
              <Image
                src={imageUrl}
                alt='Operational log evidence media preview'
                fill
                className='object-contain'
                unoptimized
              />
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
