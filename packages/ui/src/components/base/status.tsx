import { Badge } from '../ui/badge';

export function Status({
  value,
  ...props
}: { value: string } & React.ComponentProps<typeof Badge>) {
  return (
    <Badge variant="secondary" {...props} className={`min-h-4 ${props.className || ''}`}>
      {value && <span className="hidden lg:inline">{value}</span>}
    </Badge>
  );
}
