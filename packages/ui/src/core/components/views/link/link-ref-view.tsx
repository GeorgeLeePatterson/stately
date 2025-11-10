import { ExternalLink } from 'lucide-react';
import type { CoreObjectNode, CoreSchemas, CoreStateEntry } from '@/core';
import { Button } from '@/core/components/ui/button';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/core/components/ui/item';
import { ViewLinkControl } from '@/core/context/link-explore-context';
import { cn } from '@/core/lib/utils';

export interface LinkRefViewProps<Schema extends CoreSchemas = CoreSchemas> {
  label?: React.ReactNode;
  name?: string;
  urlType: string;
  value: { entity_type: CoreStateEntry<Schema>; ref: string };
  schema?: CoreObjectNode<Schema>;
  isRequired?: boolean;
}

export function LinkRefView<Schema extends CoreSchemas = CoreSchemas>({
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
              entityType={value.entity_type}
              entityName={value.ref}
              schema={schema}
            />
          )}

          {value?.ref && (
            <Button
              variant="default"
              size="icon-sm"
              className="rounded-full cursor-pointer"
              asChild
            >
              <a href={`/entities/${urlType}/${value.ref}`} target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
        </ItemActions>
      </Item>
    </>
  );
}
