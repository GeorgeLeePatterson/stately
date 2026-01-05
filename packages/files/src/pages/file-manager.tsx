import type { PageProps } from '@statelyjs/stately/layout';
import { Layout } from '@statelyjs/stately/layout';
import { FileManager, type FileManagerProps } from '@/views/file-manager';

/**
 * FileManagerPage - Convenience wrapper for FileManager with @statelyjs/ui Layout.Page
 */
export function FileManagerPage({ initialPath, ...rest }: FileManagerProps & Partial<PageProps>) {
  return (
    <Layout.Page
      {...rest}
      breadcrumbs={rest?.breadcrumbs ?? [{ label: 'Files' }]}
      description={rest?.description ?? 'Manage uploaded files and versions'}
      title={rest?.title ?? 'File Manager'}
    >
      <FileManager initialPath={initialPath} />
    </Layout.Page>
  );
}
