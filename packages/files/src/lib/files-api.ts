import { useMemo } from 'react';
import { callOperation } from '@stately/ui';
import type { OperationMeta } from '@stately/ui';
import { useStatelyUi } from '@stately/ui';
import type { FileUploadResponse } from '@/types/fs-api';

export interface FilesApiOperationIds {
  list: string;
  save: string;
  upload: string;
}

const DEFAULT_OPERATION_IDS: FilesApiOperationIds = {
  list: 'list',
  save: 'save',
  upload: 'upload',
};

export interface FilesApiOptions {
  operationIds?: Partial<FilesApiOperationIds>;
}

export function useFilesApi(options?: FilesApiOptions) {
  const { client, operationIndex, extensions } = useStatelyUi();
  const pluginOperations = (extensions as any)?.files?.operationIds as
    | Partial<FilesApiOperationIds>
    | undefined;

  const operationIds = {
    ...DEFAULT_OPERATION_IDS,
    ...(pluginOperations ?? {}),
    ...(options?.operationIds ?? {}),
  } satisfies FilesApiOperationIds;

  const resolve = (id: string): OperationMeta | null => operationIndex[id] ?? null;

  const listMeta = resolve(operationIds.list);
  const saveMeta = resolve(operationIds.save);
  const uploadMeta = resolve(operationIds.upload);

  const apiUnavailable = useMemo(() => !listMeta || !saveMeta || !uploadMeta, [
    listMeta,
    saveMeta,
    uploadMeta,
  ]);

  if (apiUnavailable) {
    console.warn(
      '[stately-files] Missing file operations in OpenAPI document. Verify the operationIds "list", "save", and "upload" (or override via plugin options).',
    );
  }

  return {
    listMeta,
    saveMeta,
    uploadMeta,
    list(args: { path?: string }) {
      if (!listMeta) throw new Error('Files list operation not available');
      return callOperation(client, listMeta, {
        params: { query: args.path ? { path: args.path } : {} },
      });
    },
    save(args: { content: string; name?: string }) {
      if (!saveMeta) throw new Error('Files save operation not available');
      return callOperation(client, saveMeta, {
        body: { content: args.content, name: args.name },
      }) as Promise<{ data: FileUploadResponse; error?: any }>;
    },
    upload(args: { body: FormData }) {
      if (!uploadMeta) throw new Error('Files upload operation not available');
      return callOperation(client, uploadMeta, {
        body: args.body,
      });
    },
    key: {
      list: (path?: string) => ['stately-files', listMeta?.operationId ?? 'list', path ?? 'data'],
      versions: (path?: string) => ['stately-files', listMeta?.operationId ?? 'list', '__versions__', path ?? ''],
    },
  };
}
