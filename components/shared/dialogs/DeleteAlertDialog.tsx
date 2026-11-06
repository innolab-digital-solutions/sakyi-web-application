import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  /** May be async; callers should catch rejections inside the handler. */
  onConfirm: () => void | Promise<void>;
  isDeleting?: boolean;
  /** Primary action label (default: Delete). */
  confirmLabel?: string;
  /** Shown while `onConfirm` is in flight (default: Deleting…). */
  confirmPendingLabel?: string;
};

export default function DeleteAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isDeleting,
  confirmLabel = 'Delete',
  confirmPendingLabel = 'Deleting…',
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className='cursor-pointer'>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer'
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? confirmPendingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
