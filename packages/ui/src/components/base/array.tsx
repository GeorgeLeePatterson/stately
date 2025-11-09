import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { Field } from '../ui/field';
import { Item } from '../ui/item';

export const ArrayIndex = ({ index }: { index: number }) => (
  <div
    className={cn(
      'bg-muted text-muted-foreground rounded-full px-2 border-border border-1',
      'w-7 min-w-0 max-w-7 h-7',
      'flex flex-col shrink-0 items-center justify-center',
      'font-mono text-[11px] whitespace-nowrap',
    )}
  >
    <span>{index}</span>
  </div>
);

export const FieldItem = ({
  children,
  ...rest
}: React.PropsWithChildren<ComponentProps<typeof Item>>) => {
  return (
    <Item {...rest} className={`flex flex-1 w-full ${rest?.className || ''}`}>
      {children}
    </Item>
  );
};

export const FieldForm = ({
  children,
  ...rest
}: React.PropsWithChildren<ComponentProps<typeof Field>>) => {
  return (
    <Field {...rest} className={`flex flex-1 w-full ${rest?.className || ''}`}>
      {children}
    </Field>
  );
};
