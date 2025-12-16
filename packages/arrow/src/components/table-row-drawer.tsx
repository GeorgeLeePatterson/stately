import { CopyButton } from '@statelyjs/ui/base/components';
import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@statelyjs/ui/base/ui';

export interface DrawerRowValue {
  key: string;
  name: string;
  value: string;
}

export interface TableRowDrawerProps {
  title?: string;
  description?: string;
  values: DrawerRowValue[];
  open?: boolean;
  onOpen: (open: boolean) => void;
}

export function TableRowDrawer({ title, description, values, open, onOpen }: TableRowDrawerProps) {
  return (
    <Drawer handleOnly onOpenChange={onOpen} open={open}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader>
          {title && <DrawerTitle>{title}</DrawerTitle>}
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className="max-h-[60vh] overflow-auto px-4 pb-4">
          <dl className="space-y-4 text-sm">
            {values.map(cell => (
              <div className="space-y-1" key={cell.key}>
                <dt className="text-muted-foreground font-medium flex items-center justify-between">
                  <span>{cell.name}</span>
                  <CopyButton value={cell.value} />
                </dt>
                <dd className="font-mono text-xs break-all rounded-md bg-muted/40 p-3 select-text">
                  {cell.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
