import { Spinner } from '@stately/ui/base/ui';

export function AnyIsLoading({
  isLoading,
  loaderOnly,
  children,
  ...rest
}: React.PropsWithChildren<{ isLoading: boolean; loaderOnly?: boolean }> &
  React.ComponentProps<typeof Spinner>) {
  return isLoading ? (
    <>
      <Spinner {...rest} /> {!loaderOnly && children}
    </>
  ) : (
    <>{children}</>
  );
}
