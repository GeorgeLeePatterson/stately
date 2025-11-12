export type FileEntryType = "file" | "directory" | "versioned_file";

export interface FileInfo {
  name: string;
  path?: string | null;
  type: FileEntryType;
  size?: number | null;
  created?: number | string | null;
  modified?: number | string | null;
  id?: string;
  displayName?: string | null;
  dir?: string | null;
  children?: FileInfo[];
  versions?: Array<{
    uuid?: string;
    id?: string | number;
    created?: number | string | null;
    created_at?: string | null;
    size?: number | null;
    path?: string | null;
  }>;
}
