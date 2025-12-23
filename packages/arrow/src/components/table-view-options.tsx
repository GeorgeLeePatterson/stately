'use client';

import { Button } from '@statelyjs/ui/components/base/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@statelyjs/ui/components/base/dropdown-menu';
import type { Table } from '@tanstack/react-table';
import { Settings2 } from 'lucide-react';

export function TableViewOptions<TData>({ table }: { table: Table<TData> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className="ml-auto hidden h-8 lg:flex" size="sm" variant="outline">
            <Settings2 />
            View
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="max-h-[60vh] w-fit min-w-[150px] max-w-[300px]">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter(column => typeof column.accessorFn !== 'undefined' && column.getCanHide())
            .map(column => {
              return (
                <DropdownMenuCheckboxItem
                  checked={column.getIsVisible()}
                  className="capitalize truncate max-w-full"
                  key={column.id}
                  onCheckedChange={value => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
