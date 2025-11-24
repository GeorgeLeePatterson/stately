import type { ComponentProps } from 'react';
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
