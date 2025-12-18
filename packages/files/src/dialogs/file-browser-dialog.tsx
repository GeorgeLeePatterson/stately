import { Button } from '@statelyjs/ui/components/base/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@statelyjs/ui/components/base/dialog';
import { FileSearch } from 'lucide-react';
import { FileManager } from '@/pages';

export function FileBrowserDialog({ initialPath }: { initialPath?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="rounded-full h-6 px-2 cursor-pointer"
          size="icon-sm"
          type="button"
          variant="secondary"
        >
          <FileSearch className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="min-h-[50vh] max-w-6xl w-[90vw] max-h-[90vh] min-w-[60vw] flex flex-col overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">File Manager</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Manage uploaded files and versions
          </DialogDescription>
        </DialogHeader>
        <FileManager initialPath={initialPath} />
      </DialogContent>
    </Dialog>
  );
}
