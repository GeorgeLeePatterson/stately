import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export function Explain({
  children,
  content,
}: React.PropsWithChildren<{ content: React.ReactNode }>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{content}</TooltipContent>
    </Tooltip>
  );
}
