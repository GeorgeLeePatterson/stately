import type { BlockquoteHTMLAttributes } from "react";

export function DescriptionLabel({
  children,
  ...rest
}: React.PropsWithChildren<BlockquoteHTMLAttributes<HTMLElement>>) {
  return (
    <span
      {...rest}
      className={[
        "min-w-0 leading-none",
        "overflow-y-visible",
        "text-xs italic font-medium text-muted-foreground",
        rest.className || "",
      ].join(" ")}
    >
      {children}
    </span>
  );
}
