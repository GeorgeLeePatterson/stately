import { cn } from '@statelyjs/ui';
import { Button } from '@statelyjs/ui/components/base/button';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from '@statelyjs/ui/components/base/item';
import { CopyPlus, ExternalLink, Trash } from 'lucide-react';
import type { CoreStateEntry } from '@/core';
import { useEntityUrl } from '@/core/hooks/use-entity-url';
import { isSingletonId } from '@/core/schema/utils';
import { useStatelyUi } from '@/index';
import type { Schemas } from '@/schema';

export interface EntityListProps<Schema extends Schemas = Schemas> {
  stateEntry: CoreStateEntry<Schema>;
  entities?: Schema['config']['components']['schemas']['Summary'][];
  onCopyEntity: (entityId: string, e: React.MouseEvent) => void;
  onRemoveEntity: (entityId: string, e: React.MouseEvent) => void;
}

export function EntityList<Schema extends Schemas = Schemas>({
  stateEntry,
  entities,
  onCopyEntity,
  onRemoveEntity,
  ...rest
}: EntityListProps<Schema> & React.HTMLAttributes<HTMLDivElement>) {
  const { schema } = useStatelyUi<Schema>();
  const resolveEntityUrl = useEntityUrl();

  const entityPath = schema.data.stateEntryToUrl[stateEntry] ?? stateEntry;

  const checkSingleton = (id: string) => {
    return isSingletonId(id) || id === 'singleton' || id === 'default';
  };

  return (
    <div {...rest} className={cn('flex flex-col flex-1 w-full min-w-0 gap-4', rest.className)}>
      {(entities ?? [])
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(entity => (
          <Item
            className="@container transition-all hover:shadow-md"
            key={entity.id}
            render={
              <a
                className="group"
                href={resolveEntityUrl({
                  id: checkSingleton(entity.id) ? 'singleton' : entity.id,
                  type: entityPath,
                })}
              >
                <ItemHeader className="items-center">
                  <ItemContent>
                    <ItemTitle className="text-base group-hover:text-primary transition-colors">
                      {/* View only link button */}
                      <Button
                        className="cursor-pointer hidden @md:flex"
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                      >
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </Button>
                      {checkSingleton(entity.id) ? 'view configuration' : entity.name}
                    </ItemTitle>
                    <ItemDescription>
                      <span className="text-xs hidden @md:flex text-muted-foreground font-mono">
                        {checkSingleton(entity.id) ? '' : entity.id}
                      </span>
                    </ItemDescription>
                  </ItemContent>

                  <ItemActions className="flex flex-nowrap gap-2 items-center">
                    {/* Actions */}
                    {!checkSingleton(entity.id) && (
                      <div className={cn('flex flex-row flex-1 justify-end gap-3')}>
                        <Button
                          className="cursor-pointer rounded-full"
                          onClick={e => onCopyEntity(entity.id, e)}
                          size="icon-sm"
                          type="button"
                          variant="ghost"
                        >
                          <CopyPlus className="w-4 h-4" />
                        </Button>
                        <Button
                          className={cn(
                            'text-destructive cursor-pointer',
                            'hover:text-white hover:bg-destructive no-underline!',
                          )}
                          onClick={e => onRemoveEntity(entity.id, e)}
                          size="icon-sm"
                          type="button"
                          variant="ghost"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </ItemActions>
                </ItemHeader>
              </a>
            }
            size="sm"
            variant="muted"
          />
        ))}
    </div>
  );
}
