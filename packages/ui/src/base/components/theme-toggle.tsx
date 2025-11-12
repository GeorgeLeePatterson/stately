import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/base/hooks/use-theme";
import { cn } from "@/base/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Determine the effective theme (handles 'system' mode)
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    // Toggle between light and dark (always set explicit theme, not system)
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "flex items-center justify-center w-9 h-9 rounded-md",
        "hover:bg-accent hover:text-accent-foreground transition-colors",
        "text-muted-foreground cursor-pointer",
      )}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
