import { FileSearch } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import { FileManager } from "../views/file-manager";

export function FileBrowserDialog({ initialPath }: { initialPath?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          className="rounded-full h-6 px-2 cursor-pointer"
        >
          <FileSearch className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="min-h-[50vh] max-w-6xl w-[90vw] max-h-[90vh] min-w-[60vw] flex flex-col overflow-y-auto">
        <DialogHeader>
          <h2 className="text-2xl font-bold">File Manager</h2>
          <p className="text-sm text-muted-foreground">
            Manage uploaded files and versions
          </p>
        </DialogHeader>
        <FileManager initialPath={initialPath} />
      </DialogContent>
    </Dialog>
  );
}
