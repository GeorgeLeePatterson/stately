import {
  AlertCircle,
  CheckCircle,
  Info,
  MessageCircleWarning,
} from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

const modeColors = {
  error: "",
  warning: "text-orange-600",
  info: "text-blue-600",
  success: "text-green-600",
  note: "",
};

const modeIcons = {
  error: AlertCircle,
  warning: MessageCircleWarning,
  info: Info,
  success: CheckCircle,
  note: Info,
};

export function Note({
  message,
  mode = "note",
}: {
  message: React.ReactNode;
  mode?: "error" | "warning" | "info" | "success" | "note";
}) {
  const Icon = modeIcons[mode];
  const color = modeColors[mode];

  return (
    <Alert
      variant={mode === "error" ? "destructive" : "default"}
      className={color}
    >
      <Icon className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
