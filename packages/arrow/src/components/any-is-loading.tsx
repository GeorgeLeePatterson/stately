import { Spinner } from '@statelyjs/ui/components/base/spinner';

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
