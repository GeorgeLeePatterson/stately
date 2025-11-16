import type { Schemas } from '@stately/schema';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/base/lib/utils';
import { Button } from '@/base/ui/button';
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/base/ui/item';
import type { CoreObjectNode, CoreStateEntry } from '@/core';
import { ViewLinkControl } from '@/core/context/link-explore-context';

export interface LinkRefViewProps<Schema extends Schemas = Schemas> {
  label?: React.ReactNode;
  name?: string;
  urlType: string;
  value: { entity_type: CoreStateEntry<Schema>; ref: string };
  schema?: CoreObjectNode<Schema>;
  isRequired?: boolean;
}

export function LinkRefView<Schema extends Schemas = Schemas>({
  label,
  name,
  urlType,
  value,
  schema,
  isRequired,
}: LinkRefViewProps<Schema>) {
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
              asChild
              className="rounded-full cursor-pointer"
              size="icon-sm"
              variant="default"
            >
              <a href={`/entities/${urlType}/${value.ref}`} rel="noreferrer" target="_blank">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
        </ItemActions>
      </Item>
    </>
  );
}
