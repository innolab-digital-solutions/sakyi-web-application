'use client';

import { AlertTriangleIcon, UploadIcon } from 'lucide-react';

import FileUploadField from '@/components/shared/form/FileUploadField';
import TextField from '@/components/shared/form/TextField';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

type ClientProfileMediaUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileName?: string;
  files: File[];
  onFilesChange: (files: File[]) => void;
  label: string;
  onLabelChange: (value: string) => void;
  isSubmitting: boolean;
  fileError?: string;
  labelError?: string;
  onConfirmUpload: () => void;
};

export default function ClientProfileMediaUploadDialog({
  open,
  onOpenChange,
  profileName,
  files,
  onFilesChange,
  label,
  onLabelChange,
  isSubmitting,
  fileError,
  labelError,
  onConfirmUpload,
}: ClientProfileMediaUploadDialogProps) {
  const displayName = profileName?.trim() || 'this client profile';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='gap-0 overflow-hidden p-0 sm:max-w-lg'>
        <AlertDialogHeader className='border-border border-b p-6'>
          <div className='flex items-start gap-3'>
            <div className='mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-700'>
              <AlertTriangleIcon className='size-5' aria-hidden />
            </div>
            <div className='space-y-1.5'>
              <AlertDialogTitle className='text-foreground/90 text-sm font-bold capitalize'>
                Upload client media
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground text-[13px] font-medium'>
                Upload one or more files for{' '}
                <span className='text-foreground text-xs font-semibold'>
                  {displayName}
                </span>{' '}
                to keep important documents and supporting evidence attached to
                this profile.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className='border-border/60 space-y-3 border-b px-6 py-4'>
          <FileUploadField
            label='Files'
            required
            multiple
            maxFiles={10}
            maxFileSize={20 * 1024 * 1024}
            accept='.jpg,.jpeg,.png,.webp,.gif,.pdf,.csv,.txt,.doc,.docx,.xls,.xlsx'
            description='Accepted: JPG, PNG, WEBP, GIF, PDF, CSV, TXT, DOC, DOCX, XLS, XLSX (max 10 files, 20MB each).'
            initialFiles={files}
            onFilesChange={onFilesChange}
            error={fileError}
            disabled={isSubmitting}
            emptyHint='Drag files here or browse'
          />
          <TextField
            label='Label'
            placeholder='Optional label (e.g. Lab Report, Progress Photos)'
            value={label}
            onChange={(event) => onLabelChange(event.target.value)}
            error={labelError}
            disabled={isSubmitting}
          />
        </div>

        <AlertDialogFooter className='bg-muted/30 border-border gap-2 border-t p-4 sm:justify-end'>
          <AlertDialogCancel
            disabled={isSubmitting}
            className='text-foreground bg-background hover:bg-muted h-10 cursor-pointer gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            Cancel
          </AlertDialogCancel>
          <Button
            type='button'
            disabled={isSubmitting}
            className='h-10 cursor-pointer gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
            onClick={onConfirmUpload}
          >
            <UploadIcon className='size-3.5' />
            {isSubmitting ? 'Uploading…' : 'Upload Files'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
