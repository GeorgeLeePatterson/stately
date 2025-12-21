import type { ButtonProps } from '@base-ui/react/button';
import { Moon, Sun } from 'lucide-react';
import { createContext, useContext, useEffect, useState } from 'react';
import { Button } from './components/base/button';
import { cn } from './lib/utils';

type ThemeProviderState = { theme: Theme; setTheme: (theme: Theme) => void };

const initialState: ThemeProviderState = { setTheme: () => null, theme: 'system' };
const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export type Theme = 'dark' | 'light' | 'system';

export type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export const defaultThemeOption: Theme = 'system';
export const defaultStorageKey = 'stately-ui-theme';

export function ThemeProvider({
  children,
  defaultTheme = defaultThemeOption,
  storageKey = defaultStorageKey,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    theme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};

export function ThemeToggle(props: ButtonProps) {
  const { theme, setTheme } = useTheme();

  // Determine the effective theme (handles 'system' mode)
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    // Toggle between light and dark (always set explicit theme, not system)
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <Button
      aria-label="Toggle theme"
      className={cn('rounded-md cursor-pointer transition-colors', props?.className)}
      onClick={toggleTheme}
      size="icon"
      variant="ghost"
      {...props}
    >
      {props.children ? (
        props.children
      ) : (
        <>{isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</>
      )}
    </Button>
  );
}
