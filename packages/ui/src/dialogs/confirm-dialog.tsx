import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/base/alert-dialog';

export const modeClasses = {
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  success: 'bg-green-600 text-white hover:bg-green-600/90',
  warning: 'bg-orange-600 text-white hover:bg-orange-600/90',
};

export interface ConfirmDialogProps {
  actionLabel: string;
  description?: string;
  mode?: 'destructive' | 'success' | 'warning';
  onConfirm: () => void;
  open?: boolean;
  setOpen: (open: boolean) => void;
}

export function ConfirmDialog({
  actionLabel,
  description,
  mode,
  onConfirm,
  open,
  setOpen,
}: ConfirmDialogProps) {
  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className={modeClasses[mode ?? 'success']} onClick={onConfirm}>
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
