
import type { ComponentProps } from 'react';
import { Field } from '../ui/field';
import { Item } from '../ui/item';

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
