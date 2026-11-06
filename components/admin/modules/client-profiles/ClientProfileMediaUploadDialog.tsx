'use client';

import { UploadIcon } from 'lucide-react';

import {
  enrollmentWizardDialogContentClass,
  enrollmentWizardDialogFooterClass,
  wizardOutlineButtonClass,
  wizardPrimaryButtonClass,
} from '@/components/admin/modules/enrollmentWizardModalUi';
import FileUploadField from '@/components/shared/form/FileUploadField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils/styles';

const ACCEPT =
  '.jpg,.jpeg,.png,.webp,.gif,.bmp,.heic,.heif,.avif,.pdf,.csv,.txt,.doc,.docx,.xls,.xlsx';
const MAX_FILES = 10;
const MAX_FILE_BYTES = 20 * 1024 * 1024;

type ClientProfileMediaUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileName?: string;
  files: File[];
  onFilesChange: (files: File[]) => void;
  isSubmitting: boolean;
  fileError?: string;
  onConfirmUpload: () => void;
};

export default function ClientProfileMediaUploadDialog({
  open,
  onOpenChange,
  profileName,
  files,
  onFilesChange,
  isSubmitting,
  fileError,
  onConfirmUpload,
}: ClientProfileMediaUploadDialogProps) {
  const displayName = profileName?.trim() || 'this client';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={!isSubmitting}
        className={cn(enrollmentWizardDialogContentClass, 'min-h-0')}
      >
        <div className='border-border flex min-h-0 flex-1 flex-col overflow-hidden'>
          <DialogHeader className='border-border shrink-0 border-b px-6 pt-6 pb-4 text-left'>
            <DialogTitle className='text-foreground text-[15.5px] font-bold capitalize'>
              Save files & documents
            </DialogTitle>
            <DialogDescription className='text-muted-foreground text-[13px] leading-relaxed font-medium'>
              Upload one or more files for{' '}
              <span className='text-foreground font-semibold'>
                {displayName}
              </span>{' '}
              to keep important documents and supporting evidence attached to
              this profile.
            </DialogDescription>
          </DialogHeader>

          <div className='min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-6 py-4'>
            <FileUploadField
              label='Files & Documents'
              required
              multiple
              maxFiles={MAX_FILES}
              maxFileSize={MAX_FILE_BYTES}
              accept={ACCEPT}
              initialFiles={files}
              onFilesChange={onFilesChange}
              error={fileError}
              disabled={isSubmitting}
              emptyHint='Drag files here or browse'
            />
          </div>
        </div>

        <DialogFooter
          className={cn(enrollmentWizardDialogFooterClass, 'shrink-0')}
        >
          <Button
            type='button'
            variant='outline'
            disabled={isSubmitting}
            className={wizardOutlineButtonClass}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type='button'
            variant='default'
            disabled={isSubmitting}
            className={wizardPrimaryButtonClass}
            onClick={onConfirmUpload}
          >
            <UploadIcon className='size-3.5 shrink-0' />
            {isSubmitting ? 'Uploading…' : 'Upload files'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
