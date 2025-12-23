import { ConfirmDialog } from '@statelyjs/ui/dialogs/confirm-dialog';

export function EntityRemove({
  typeName,
  entityName,
  onConfirm,
  isOpen,
  setIsOpen,
}: {
  typeName: string;
  entityName?: string;
  isOpen?: boolean;
  setIsOpen: (o: boolean) => void;
  onConfirm: () => void;
}) {
  const identifer = entityName ? ` "${entityName}"` : '';
  const description =
    `This will permanently delete the ${typeName.toLowerCase()}${identifer}. ` +
    'This action cannot be undone.';

  return (
    <ConfirmDialog
      actionLabel="Delete"
      description={description}
      mode="destructive"
      onConfirm={onConfirm}
      open={isOpen}
      setOpen={setIsOpen}
    />
  );
}
