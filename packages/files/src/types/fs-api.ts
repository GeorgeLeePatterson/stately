import type { FileInfo } from './file';

export interface FileListResponse {
  files: FileInfo[];
}

export interface FileUploadResponse {
  path: string;
}
