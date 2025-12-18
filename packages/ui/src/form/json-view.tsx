import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/base/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/base/collapsible';
import { Item, ItemActions, ItemContent } from '@/components/base/item';

export interface JsonViewProps {
  data: any;
  isOpen?: boolean;
  setIsOpen: (open: boolean) => void;
}

export function JsonView({ data, isOpen, setIsOpen }: JsonViewProps) {
  return (
    <Collapsible onOpenChange={setIsOpen} open={isOpen}>
      <CollapsibleTrigger
        render={
          <Item onClick={() => setIsOpen(!isOpen)} size="sm" variant="outline">
            <ItemContent>Full JSON Configuration</ItemContent>
            <ItemActions>
              <Button size="sm" type="button" variant="ghost">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </ItemActions>
          </Item>
        }
      />
      <CollapsibleContent>
        <div className="p-2">
          <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm max-h-96">
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
