import { AlertCircle, CheckCircle, Info, MessageCircleWarning } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

const modeColors = {
  error: '',
  info: 'text-blue-600',
  note: '',
  success: 'text-green-600',
  warning: 'text-orange-600',
};

const modeIcons = {
  error: AlertCircle,
  info: Info,
  note: Info,
  success: CheckCircle,
  warning: MessageCircleWarning,
};

export function Note({
  message,
  mode = 'note',
}: {
  message: React.ReactNode;
  mode?: 'error' | 'warning' | 'info' | 'success' | 'note';
}) {
  const Icon = modeIcons[mode];
  const color = modeColors[mode];

  return (
    <Alert className={color} variant={mode === 'error' ? 'destructive' : 'default'}>
      <Icon className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
