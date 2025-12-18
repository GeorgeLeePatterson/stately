import { Separator } from '@/components/base/separator';
import { ThemeToggle } from '@/theme';

export interface HeaderProps {
  before?: React.ReactNode;
  pageTitle?: string;
  disableThemeToggle?: boolean;
}

export function Header({
  before,
  pageTitle,
  children,
  disableThemeToggle,
}: React.PropsWithChildren<HeaderProps>) {
  return (
    <header className="stately-header flex h-16 shrink-0 items-center gap-2 border-b px-4">
      {before}
      <Separator className="mr-2 h-4" orientation="vertical" />
      <div className="flex flex-1 items-center justify-between">
        {pageTitle && <h1 className="text-2xl font-semibold text-foreground mr-2">{pageTitle}</h1>}
        <div className="flex flex-auto items-center gap-3 justify-end">
          {children}

          {/* Theme Toggle */}
          {!disableThemeToggle && <ThemeToggle />}
        </div>
      </div>
    </header>
  );
}
