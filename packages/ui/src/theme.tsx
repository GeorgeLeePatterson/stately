import type { ButtonProps } from '@base-ui/react/button';
import { Monitor, Moon, Sun } from 'lucide-react';
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

  // Cycle through: system → light → dark → system
  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    setTheme(nextTheme);
  };

  // Determine which icon to show based on current theme setting
  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun aria-label="Light Mode" className="w-5 h-5" />;
      case 'dark':
        return <Moon className="w-5 h-5" />;
      default: // 'system'
        return <Monitor className="w-5 h-5" />;
    }
  };

  return (
    <Button
      aria-label="Toggle theme"
      className={cn('rounded-md cursor-pointer transition-colors', props?.className)}
      onClick={toggleTheme}
      size="icon"
      title={theme}
      variant="ghost"
      {...props}
    >
      {props.children ? <>(props.children)</> : getIcon()}
    </Button>
  );
}
