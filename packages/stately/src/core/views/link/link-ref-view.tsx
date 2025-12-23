import { cn } from '@statelyjs/ui';
import { Button } from '@statelyjs/ui/components/base/button';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@statelyjs/ui/components/base/item';
import { ExternalLink } from 'lucide-react';
import type { CoreStateEntry } from '@/core';
import { ViewLinkControl } from '@/core/context/link-explore-context';
import { useEntityUrl } from '@/core/hooks';
import type { Schemas } from '@/core/schema';
import type { ObjectNode } from '@/core/schema/nodes';

export interface LinkRefViewProps<Schema extends Schemas = Schemas> {
  label?: React.ReactNode;
  name?: string;
  entityUrlPath: string;
  value: { entity_type: CoreStateEntry<Schema>; ref: string };
  schema?: ObjectNode;
  isRequired?: boolean;
}

export function LinkRefView<Schema extends Schemas = Schemas>({
  label,
  name,
  entityUrlPath,
  value,
  schema,
  isRequired,
}: LinkRefViewProps<Schema>) {
  const resolveEntityUrl = useEntityUrl();

  return (
    <>
      <Item
        className={cn('flex-1 bg-muted', isRequired && !value?.ref ? 'border-red-500' : '')}
        size="sm"
      >
        <ItemContent>
          <ItemTitle>
            Name:{' '}
            {name ||
              value.ref ||
              (isRequired ? <span className="text-red-500">Invalid, missing ref</span> : 'Unknown')}
          </ItemTitle>
          {label && <ItemDescription>{label} Configuration</ItemDescription>}
        </ItemContent>
        <ItemActions>
          {/* Convenience button to view configuration */}
          {schema && value?.ref && (
            <ViewLinkControl
              entityName={value.ref}
              entityType={value.entity_type}
              schema={schema}
            />
          )}

          {value?.ref && (
            <Button
              className="rounded-full cursor-pointer"
              render={
                <a
                  href={resolveEntityUrl({ id: value.ref, type: entityUrlPath })}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              }
              size="icon-sm"
              variant="default"
            />
          )}
        </ItemActions>
      </Item>
    </>
  );
}
