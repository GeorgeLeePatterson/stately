import { Eye } from 'lucide-react';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { Button } from '@/base/ui/button';
import { type LinkEntityProps, ViewLinkDialog } from '@/core/dialogs/view-configure-dialog';
import type { Schemas } from '@/core/schema';

export function ViewLinkControl<Schema extends Schemas = Schemas>(props: LinkEntityProps<Schema>) {
  const { openLinkExplorer } = useLinkExplorer();
  return (
    <Button
      className="rounded-md cursor-pointer text-xs"
      onClick={() => openLinkExplorer(props)}
      size="sm"
      type="button"
      variant="ghost"
    >
      <Eye size={16} />
      <span className="hidden lg:inline ">View Details</span>
    </Button>
  );
}

export interface LinkExplorerContextValue<Schema extends Schemas = Schemas> {
  openLinkExplorer: (info: LinkEntityProps<Schema>) => void;
  closeLinkExplorer: () => void;
  navigateToIndex: (index: number) => void;
  breadcrumbs: LinkEntityProps<Schema>[];
}

const LinkExplorerContext = createContext<LinkExplorerContextValue | null>(null);

export function LinkExplorerProvider({ children }: { children: ReactNode }) {
  const [entityStack, setEntityStack] = useState<LinkEntityProps<Schemas>[]>([]);

  const openLinkExplorer = useCallback((info: LinkEntityProps<Schemas>) => {
    setEntityStack(prev => {
      const current = prev[prev.length - 1];
      // Avoid pushing duplicate
      if (current?.entityType === info.entityType && current?.entityName === info.entityName) {
        return prev;
      }
      return [...prev, info];
    });
  }, []);

  const closeLinkExplorer = useCallback(() => {
    setEntityStack(prev => (prev.length > 1 ? prev.slice(0, -1) : []));
  }, []);

  const navigateToIndex = useCallback((index: number) => {
    setEntityStack(prev => prev.slice(0, index + 1));
  }, []);

  const onOpenChange = useCallback((open: boolean) => {
    if (open) return;
    setEntityStack([]);
  }, []);

  // Memoized current entity (last item in stack)
  const currentEntity = useMemo(
    () => (entityStack.length > 0 ? entityStack[entityStack.length - 1] : null),
    [entityStack],
  );

  const value = useMemo(
    () => ({ breadcrumbs: entityStack, closeLinkExplorer, navigateToIndex, openLinkExplorer }),
    [openLinkExplorer, closeLinkExplorer, navigateToIndex, entityStack],
  );

  return (
    <LinkExplorerContext.Provider value={value}>
      {children}
      {currentEntity && (
        <ViewLinkDialog
          {...currentEntity}
          breadcrumbs={entityStack}
          onNavigateToBreadcrumb={navigateToIndex}
          onOpenChange={onOpenChange}
          open={true}
        />
      )}
    </LinkExplorerContext.Provider>
  );
}

export function useLinkExplorer<Schema extends Schemas = Schemas>() {
  const context = useContext(LinkExplorerContext);
  if (!context) {
    throw new Error('useLinkExplorer must be used within LinkExplorerProvider');
  }
  return context as unknown as LinkExplorerContextValue<Schema>;
}
